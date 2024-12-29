import User from "../models/userModel.js";
import Wallet from "../models/WalletModal.js";
import Product from "../models/productModal.js";
import Order from "../models/OrderModal.js"
import razorpay from "../razorpay/razorpay.js";
import { v4 as uuidv4 } from "uuid"; 



const createTransaction = async (req, res) => {
    const { amount, currency, userId, orderItems, paymentMethord, shippingAddress, orderSubtotal, orderTotal, discount, discountValue, couponCode,minPurchase } = req.body;
  console.log(amount);
    const options = {
      amount: parseInt(amount * 100),
      currency: currency || "INR",
    };
  
    try {
     
      const existingOrder = await Order.findOne({
        userId,
        orderStatus: "pending payment",
    });


       const razorpayOrder = await razorpay.orders.create(options);
      const orderNumber = `ORD${uuidv4().slice(0, 6).toUpperCase()}`;

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
        orderStatus: "pending payment",
        razorId: razorpayOrder.id, 
        minPurchase,
      });
  
      await newOrder.save();
  

      res.status(200).json({ message: "Success", order: razorpayOrder });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };


const retryPayment = async (req, res) => {
  const { razorId, productId } = req.body; 
  console.log(req.body);

  try {
      const order = await Order.findOne({ razorId }).populate('orderItems.productId');
      console.log(order);

      if (!order) {
          return res.status(404).json({ message: "Order not found." });
      }

      const product = order.orderItems.find(item => item.productId._id.toString() === productId);
      console.log("Product found:", product);

      if (!product) {
          return res.status(404).json({ message: "Product not found in the order." });
      }

      if (product.itemStatus !== "payment failed") {
          return res.status(400).json({ message: "Retry payment is only allowed for failed products." });
      }

  
      let retrypaymentAmount=product.quantity*(product.offerPrice ? product.offerPrice : product.price) 
      if(order.minPurchase && retrypaymentAmount>=order.minPurchase){
        retrypaymentAmount-=order.discountValue
      }else if(order.minPurchase){
        const retryPaymentProducts=order.orderItems.filter(
          (item)=>
            item.itemStatus==='payment failed' &&
          item.productId._id.toString()!== productId
        );
        let discountApplied=false
        for (const item of retryPaymentProducts){
          let itemRetryAmount=item.quantity*(item.productId.offerPrice ? item.productId.offerPrice : item.productId.price)

          if(itemRetryAmount>=order.minPurchase){
            discountApplied=true
            break
          }
        }
        if(!discountApplied){
          console.log("No product satisfy coupen min purchse")
        }
      }
   const amountToPay= parseInt(Math.max(0, (parseInt(retrypaymentAmount)+100) * 100));
      console.log('Amount to pay for the product with largest price (in paise):', amountToPay);

      const options = {
          amount:amountToPay,
          currency: "INR",
      };

      const razorpayOrder = await razorpay.orders.create(options);

      product.itemStatus = "payment success"; 
      order.orderTotal=amountToPay/100
      product.razorId = razorpayOrder.id; 
      await order.save();

      res.status(200).json({
          message: "Retry payment initialized.",
          razorpayOrder,
          amountToPay,
      });
  } catch (error) {
      console.error("Error during retry payment:", error);
      res.status(500).json({ message: "Server error during retry payment.", error });
  }
};






export {createTransaction,retryPayment}