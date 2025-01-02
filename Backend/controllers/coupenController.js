import Cart from "../models/cartModal.js";
import Coupen from "../models/coupenModal.js";
import Coupon from "../models/coupenModal.js";

const createCoupen = async (req, res) => {
    const { code, discount, discountType,maxDiscount, minPurchase, maxUsage, expiresAt } = req.body

    if (!code || !discount || !discountType || !minPurchase || !expiresAt) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if(!maxDiscount){
      return res.status(400).json({ message: "Missing required field(maxDiscount)" });
    }

    if (discountType === 'percentage' && discount > 50) {
        return res.status(400).json({message:"discount percentage can not be 50%"})
      }
    try {
        const isCoupenExist = await Coupon.findOne({ code });
        if (isCoupenExist) {
            // return res.status(400).json({ message: "Coupen alredy exists" })
            if(isCoupenExist.isActive){
              return res.status(400).json({message:'Coupon code already exists and is active'})
            }

            isCoupenExist.discount=discount;
            isCoupenExist.discountType=discountType;
            isCoupenExist.maxDiscount=maxDiscount;
            isCoupenExist.minPurchase=minPurchase;
            isCoupenExist.maxUsage=maxUsage;
            isCoupenExist.expiresAt=expiresAt;
            isCoupenExist.isActive=true;

            await isCoupenExist.save()
            return res.status(200).json({ message: "Coupen savedd successfully", coupen:isCoupenExist })
        }


        const coupen = new Coupon({
            code,
            discount,
            discountType,
            maxDiscount,
            minPurchase,
            maxUsage,
            expiresAt,
        })

        await coupen.save();
        res.status(200).json({ message: "Coupen savedd successfully", coupen })

    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

 const getCoupon=async (req,res)=>{
    try{
     const coupen=await Coupon.find()
     if(!coupen){
        return res.status(404).json({message:"Coupen not fount"})
     }
     res.status(200).json({message:"Coupen fetched successfully",coupen})
    }catch(error){
      return res.status(500).json({message:"internal server error"})
    }
 }

const validateCoupon = async (req, res) => {
    const { code, cartTotal } = req.body;

    try {
        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }

        if (coupon.expiryDate < new Date()) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        if (coupon.usedCount >= coupon.maxUsage) {
            return res.status(400).json({ message: "Coupon usage limit reached" });
        }

        if (cartTotal < coupon.minOrderValue) {
            return res.status(400).json({
                message: `Minimum order value of ${coupon.minOrderValue} required to use this coupon`,
            });
        }

        res.status(200).json({ message: "Coupon is valid", coupon });
    } catch (error) {
        console.error("Error validating coupon:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const editCoupen=async (req,res)=>{
    const id =req.params.id;
    const {discount, maxDiscount,discountType, minPurchase, maxUsage, expiresAt } = req.body

    try{
        const coupen=await  Coupon.findByIdAndUpdate(id,{discount, maxDiscount,discountType, minPurchase, maxUsage, expiresAt } ,{new:true})
         if(!coupen){
            return res.status(404).json({message:"Coupen not fount"})
         }
         res.status(200).json({message:"Coupen updated successfully",coupen})
    }catch(error){
        console.error("Error updating coupon:", error);
        res.status(500).json({message:"Server error"})
    }
}

const deleteCoupen=async (req,res)=>{
    const id=req.params.id
    try{
        const coupon=await Coupen.findById(id)
        if(!coupon){
            return res.status(404).json({ message: 'Coupon not found' }); 
        }
        
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    return res.status(200).json({ message: 'Coupon deleted successfully', coupon });
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const applyCoupen=async (req,res)=>{
    try{
      const userId=req.params.id;
      const {code}=req.body;
       
      const coupen=await Coupen.findOne({code,isActive:true});
      if(!coupen || new Date()>coupen.expiresAt){
        return res.status(400).json({message:"Inavalid or expired coupen"})
      }
    
    
      const userUsage=coupen.userData.find(
        (user)=>user.userId.toString()===userId
      )
      if(userUsage){
        return res.status(400).json({message:"Coupen already used"})
      }
      const cart=await Cart.findOne({userId})
      if(!cart){
        return res.status(404).json({message:"Cart not found"})
      }
      const total=cart.items.reduce(
        (sum,item)=>sum+(item.offerPrice ? item.offerPrice : item.price) * item.quantity,0
      )

      if(total<coupen.minPurchase){
        return res.status(400).json({message:`Coupen can only applied for purchase of at least ${coupen.minPurchase}`})
      }

      let discount =
      coupen.discountType === "percentage" && (total * coupen.discount) / 100
        
        // console.log("Total Price:", total);
        // console.log("Coupon Discount Type:", coupen.discountType);
        // console.log("Coupon Discount:", coupen.discount);
        // console.log("Calculated Discount:", discount);

        cart.coupon={
          code:coupen.code,
          discount,
          minPurchase:coupen.minPurchase,
        }

        if(coupen.maxDiscount && discount>coupen?.maxDiscount){
          discount=coupen.maxDiscount
        }
        console.log("discount",discount);

      // coupen.userData.push({ userId, usageCount: 1 });
      // await coupen.save();
      await cart.save();
      res.status(200).json({message:"Coupen applied successfully",cart,discount,discountedPrice: total - discount,minPurchase:coupen.minPurchase
      })
    }catch(error){
      console.log(error);
      
      res.status(500).json({message:"Internal server error",error})
    }
}

export { validateCoupon, createCoupen ,getCoupon,editCoupen,deleteCoupen,applyCoupen}
