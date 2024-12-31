import Order from '../../Backend/models/OrderModal.js'
import User from '../../Backend/models/userModel.js'
import Product from '../../Backend/models/productModal.js' 
import { v4 as uuidv4 } from "uuid"; 
import Cart from '../models/cartModal.js';
import Coupon from '../models/coupenModal.js';
import Wallet from '../models/WalletModal.js';
import mongoose from 'mongoose';
import razorpay from '../razorpay/razorpay.js';




const placeOrder = async (req, res) => {
  try {
    const { userId, orderItems, paymentMethord, shippingAddress, couponCode,totalAmount,discountValue,minPurchase } = req.body;




    let orderSubtotal = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      orderSubtotal += product.price * item.quantity;

      product.stock -= item.quantity;
      await product.save();

    }

    const shippingCost = 100;
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon || coupon.expiryDate < new Date()) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }

      if (coupon.usedCount >= coupon.maxUsage) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      if (orderSubtotal < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value of ${coupon.minOrderValue} required to use this coupon`,
        });
      }

      discount =
        coupon.discountType === "percentage"
          ? (orderSubtotal * coupon.discountValue) / 100
          : coupon.discountValue;

      discount = Math.min(discount, orderSubtotal); 

      coupon.usedCount += 1;
      await coupon.save();
    }


  
    const orderTotal=totalAmount;
    const orderNumber = `ORD${uuidv4().slice(0, 6).toUpperCase()}`;
    const orderStatus="pending";
 
   

    const newOrder = new Order({
      userId,
      orderItems,
      orderNumber,
      paymentMethord,
      shippingAddress,
      orderSubtotal,
      orderTotal,
      discount,
      discountValue,
      couponCode,
      orderStatus,
      minPurchase
    });
    await newOrder.save();

    res.status(200).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status, itemId } = req.body;
   
    
    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "payment failed",
      "payment success"
    ];


    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    
    const order = await Order.findOne({ orderNumber:id.trim() });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (itemId) {
   
      const item = order.orderItems.find(
        (item) => item._id.toString() === itemId
      );
      if (!item) {
        return res.status(404).json({ message: "Product not found in the order" });
      }
      item.itemStatus = status; 
    } else {
    
      order.orderStatus = status;

      if (["pending","confirmed","shipped","delivered", "cancelled","returned","payment failed"].includes(status)) {
        order.orderItems.forEach((item) => {
          item.itemStatus = status;
        });
      }
    }

  
    await order.save();

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
};


const getUserOrders = async (req, res) => {
  try {
    const userId  = req.user.id;
    
    const orders = await Order.find({userId}).sort({createdAt:-1}).populate("orderItems.productId").populate("userId");
  
    
    const updateOrders = orders.map(order => {
      const products = order.orderItems.map(item => {
        
        return {
          name: item.productId?.name,
          image: item.productId?.images[0],
          quantity:item.productId?.quantity,
          discountPrice:item.productId?.discountPrice,
          offerPrice:item.productId?.offerPrice,
          id:item.productId?._id,
          price:item.price,
          quantity:item.quantity,
        itemStatus:item.itemStatus
        }
      })
      return {
        ...order.shippingAddress,
        orderNumber:order.orderNumber,
        id:order._id,
        name:order.userId.username,
        email:order.userId.email,
        orderStatus:order.orderStatus,
        orderSubtotal: order.orderSubtotal,
        discountPrice:order.discountValue,
        orderTotal:order.orderTotal,
        razorId:order?.razorId,
        paymentMethord:order.paymentMethord,
        products,
        minPurcase:order.minPurchase,
        cancelReason:order.reasons.cancelReason,
        returnReason:order.reasons.returnReason
      }
    })

 
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({ message: "User orders fetched successfully", orders:updateOrders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching user orders", error: error.message });
  }
};


const cancelOrder = async (req, res) => {
  const { userId, orderId, productId } = req.params;
  const { cancelRreason } = req.body;

  if (!productId || !orderId || !userId) {
    return res.status(400).json({ message: "Missing parameters." });
  }
  if (!cancelRreason) {
    return res.status(400).json({ message: "Missing cancel reason." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const order = await Order.findOne({ userId, _id: orderId, "orderItems.productId": productId }).populate(
      "orderItems.productId",
      "offerPrice"
    );

    if (!order) {
      return res.status(404).json({ message: "Order or product not found." });
    }

    const orderItem = order.orderItems.find((item) => item.productId._id.toString() === productId);

    if (!orderItem) {
      return res.status(404).json({ message: "Product not found in the order." });
    }

    if (["cancelled", "returned","delivered"].includes(orderItem.itemStatus)) {
      return res.status(400).json({
        message: `Cannot cancel a product with status '${orderItem.itemStatus}'.`,
      });
    }

    orderItem.itemStatus = "cancelled";
    order.reasons.cancelReason = cancelRreason;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

   
    product.stock += orderItem.quantity;
    await product.save();

    if (order.paymentMethord !== "COD") {
      
      if (orderItem.itemStatus !== "payment failed") {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
          return res.status(404).json({ message: "Wallet not found." });
        }

        let refundAmount = orderItem.quantity * (product.offerPrice ? product.offerPrice : product.price);

       
        if(order.minPurchase && refundAmount>=order.minPurchase){
          refundAmount-=order.discountValue
        }else if(order.minPurchase){
          const cancellingItems = order.orderItems.filter(
            (item) =>
              item.itemStatus === "cancelled" &&
              item.productId._id.toString() !== productId
          );
          let discountApplied=false
          for(const item of cancellingItems){
            const itemRefundAmount=item.quantity*(item.productId.offerPrice ? item.productId.offerPrice : item.productId.price)
            console.log("item refund",itemRefundAmount);
            console.log("coupen minPurchase",order.minPurchase)
            if(itemRefundAmount>=order.minPurchase){
              console.log("amound",refundAmount-order.discountValue);
            }
            
            if(itemRefundAmount>=order.minPurchase){
              discountApplied=true;
              break;
            }
          }
          if(!discountApplied){
            console.log("No product satisfy coupen min purchse");
          }
        }
        wallet.balance+=refundAmount;
        wallet.transactions.push({
          type:"credit",
          amount:refundAmount,
          description:`Refund for canceled product (${order.orderNumber})`
        })

        await wallet.save();
      } else {
        console.log("Item status is 'failed'. No refund will be processed.");
      }
    }
    await order.save();

    res.status(200).json({ message: "Order canceled successfully." });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Error occurred while canceling the order.", error: error.message });
  }
};


const fetchAllOrderData = async (req, res) => {
  try {

const limit=parseInt(req.query.limit) || 5;
const page=parseInt(req.query.page) || 1;
const skip=(page-1) * limit

       const totalOrders = await Order.countDocuments();
       const orders = await Order.find()
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit)
      .populate('userId', "username")
      .populate('orderItems.productId');

   
 
   


    const updatedOrder = orders.map((order) => {
      const products = order.orderItems.map(item => {
        return {
          name: item.productId?.name,
          image: item.productId?.images[0],
          quantity: item.productId?.quantity,
          id: item.productId?._id,
          price: item.price,
          discountPrice: item.discountPrice,
          quantity: item.quantity,
          itemStatus: item.itemStatus,
        };
      });

      return {
        ...order.shippingAddress,
        orderNumber: order.orderNumber,
        id: order._id,
        discountValue:order?.discountValue,
        orderStatus: order.orderStatus,
        orderTotal: order.orderTotal,
        orderSubtotal: order.orderSubtotal,
        paymentMethord: order.paymentMethord,
        date: order.createdAt,
        products,
        razorId:order?.razorId,
        name: order?.userId?.username,
        userId: order?.userId?._id,
        cancelReason:order.reasons.cancelReason,
        returnReason:order.reasons.returnReason,
        minPurchase:order.minPurchase,
      };
    });

     console.log(updatedOrder);
    
      res.status(200).json({
      message: "Order data fetched successfully",
      orders: updatedOrder,
      totalOrders, 

    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


const returnPayment = async (req, res) => {
  const { userId, orderId, productId } = req.params;
  const { returnReason } = req.body;

  if (!productId || !orderId || !userId) {
    return res.status(400).json({ message: "Missing parameters." });
  }
  if (!returnReason) {
    return res.status(400).json({ message: "Missing return reason." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const order = await Order.findOne({ userId, _id: orderId, "orderItems.productId": productId }).populate(
      "orderItems.productId",
      "offerPrice"
    );

    if (!order) {
      return res.status(404).json({ message: "Order or product not found." });
    }

    const orderItem = order.orderItems.find((item) => item.productId._id.toString() === productId);

    if (!orderItem) {
      return res.status(404).json({ message: "Product not found in the order." });
    }

    if (["returned", "cancelled"].includes(orderItem.itemStatus)) {
      return res.status(400).json({
        message: `Cannot return a product with status '${orderItem.itemStatus}'.`,
      });
    }

    if (orderItem.itemStatus !== "delivered") {
      return res.status(400).json({
        message: "Only delivered products can be returned!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.stock += orderItem.quantity;
    await product.save();

    
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found." });
      }

      let refundAmount = orderItem.quantity * (product.offerPrice ? product.offerPrice : product.price);

      
      if(order.minPurchase && refundAmount>=order.minPurchase){
        refundAmount-=order.discountValue
      }else if(order.minPurchase){
        const returningItems=order.orderItems.filter(
          (item) => item.itemStatus === "returned" && item.productId._id.toString() !== productId
        );
        let discountApplied=false;
        for(const item of returningItems){
          const itemRefundAmount=item.quantity*(product.offerPrice ? product.offerPrice : product.price);
          if(itemRefundAmount>=order.minPurchase){
             discountApplied=true;
             break
          }
        }
        if(!discountApplied){
          console.log("No product satisfy coupen min purchse");
        }
      }
      wallet.balance+=refundAmount
      wallet.transactions.push({
        type:"credit",
        amount:refundAmount,
        description:`Refund for returning a product(${order.orderNumber}) `
      })

      await wallet.save();
    

    orderItem.itemStatus = "returned";
    order.reasons.returnReason = returnReason;

    await order.save();

    res.status(200).json({ message: "Order returned successfully.", order });
  } catch (error) {
    console.error("Error processing return:", error);
    res.status(500).json({ message: "Error occurred while processing the return.", error: error.message });
  }
};



const handlePaymentStatus = async (req, res) => {
  try {
    const { razorId, paymentStatus } = req.body; 
  
     console.log(  'status change body ',req.body);
  
    if (!["payment failed", "payment success"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

   
    const order = await Order.findOne({razorId});
    console.log(order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

  
    order.orderStatus = paymentStatus;
    order.orderItems.forEach((item) => {
      item.itemStatus = paymentStatus;
    });

    await order.save();
  //  console.log(order);
   
 
    res.status(200).json({
      message: "Order payment status updated successfully",
      order,
    });
  } catch (error) {
   
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const salesReport=async (req,res)=>{
  try{
    let { startDate, endDate, period } = req.body;

    if(startDate && endDate){
      startDate=new Date(startDate)
      endDate=new Date(endDate)
      if(endDate<startDate){
        return res.status(400).json({message:"End date cannot be earlier than the start date."})
      }
    }

    if (period === "daily") {
      ({ startDate, endDate } = dailyRange());
    } else if (period === "weekly") {
      ({ startDate, endDate } = weeklyRange());
    } else if (period === "monthly") {
      ({ startDate, endDate } = monthlyRange());
    }  else if (period === "yearly") {
      ({ startDate, endDate } = YearlyRange());
    } 
    else {
      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const dailyReport=await Order.aggregate([
{
  $match:{
    createdAt:{
      $gte:startDate,
      $lte:endDate,
    },
    orderStatus:"delivered"
  }
},
{
  $group:{
    _id:{$dateToString:{format:"%Y-%m-%d",date:"$createdAt"}},
    totalRevanue:{$sum:"$orderTotal"},
    totalDiscount:{$sum:"$discountValue"},
    netSale:{
      $sum:{$subtract:["$orderTotal","$discountValue"]}
    },
    orderCount:{$sum:1},
    itemsSold:{$sum :{$sum:"$items.quantity"}},
    userName:{$first:"$userDetails.name"}
  }
},
{$sort:{_id:1}},
    ])


    const overAllSummery=await Order.aggregate([
      {
        $match:{
          createdAt:{
            $gte:startDate,
            $lte:endDate
          },
          orderStatus:"delivered"
        }
      },
      {
        $group:{
          _id:null,
          totalRevanue:{$sum :"$orderTotal"},
          totalDiscount:{$sum :"$discountValue"},
          netSale:{
            $sum:{$subtract:["$orderTotal","$discountValue"]}
          },
          orderCount:{$sum:1}
        }
      }
    ])

    res.status(200).json({dailyReport,overAllSummery:overAllSummery.length>0 ? overAllSummery : {},})
  }catch(error){
    console.log(error);
    
   res.status(500).json({message:"Internal server error",error})
  }
}


const dailyRange = () => {
  const today = new Date();

  

  if (!(today instanceof Date) || isNaN(today.getTime())) {
    console.error("today is not a valid Date object", today);
    return;  
  }
  today.setHours(0, 0, 0, 0);
  console.log("Updated today:", today);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  console.log("End of day:", endOfDay);

  return { startDate: today, endDate: endOfDay };
};


const weeklyRange=()=>{
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  return { startDate: startOfWeek, endDate: today };
}


const monthlyRange=()=>{
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(today);
  startOfMonth.setDate(today.getDate() - 29);
  startOfMonth.setHours(0, 0, 0, 0);
  return { startDate: startOfMonth, endDate: today };
}

const YearlyRange = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st
  startOfYear.setHours(0, 0, 0, 0);

  const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31st
  endOfYear.setHours(23, 59, 59, 999);

  return { startDate: startOfYear, endDate: endOfYear };
};
export { placeOrder, getUserOrders,cancelOrder ,fetchAllOrderData,updateOrderStatus,salesReport,returnPayment,handlePaymentStatus};
