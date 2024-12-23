import Product from "../models/productModal.js";
import Wishlist from "../models/wishlistModal.js";


const addToWishList = async (req, res) => {
  const userId = req.params.id;
  const { productId, price } = req.body;

  if (!userId) {
      return res.status(404).json({ message: "User does not exist" });
  }

  try {
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      let wishlist = await Wishlist.findOne({ userId });

      if (!wishlist) {
          // Create a new wishlist if none exists
          wishlist = new Wishlist({
              userId,
              items: [{ productId, price }],
          });
      } else {
          // Initialize items array if missing
          if (!Array.isArray(wishlist.items)) {
              wishlist.items = [];
          }

          // Check if the product already exists in the wishlist
          const productIndex = wishlist.items.findIndex(
              (item) => item.productId.toString() === productId
          );

          if (productIndex >= 0) {
              // Update the existing product's price
              wishlist.items[productIndex].price = price;
          } else {
              // Add the new product to the wishlist
              wishlist.items.push({ productId, price });
          }
      }

      // Save the wishlist
      await wishlist.save();

      res.status(200).json({
          message: "Product added to wishlist",
          wishlist,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: "Error adding product to wishlist",
          error: error.message,
      });
  }
};



 const fetchWishList=async (req,res)=>{
 try{
    const userId=req.params.id;

    if(!userId){
        res.status(404).json({message:'User not found'})
    }

    const wishlist=await Wishlist.findOne({userId}).populate("items.productId")
    if(!wishlist){
        return res.status(404).json({message:"Wishlist not found"})
    }
    res.status(200).json({message:"Wishlist fetched successfully",wishlist})

 }catch(error){
  res.status(500).json({message:"Error fetching wishlist"})
 }

 }

 const removeFromWishlist=async (req,res)=>{
    const userId=req.params.userId;
    const productId=req.params.productId;

    console.log(userId,productId)
    try{
        const wishlist=await Wishlist.findOne({userId})
        if(!wishlist){
          return res.status(404).json({message:"wishlist not found"})   
        }

        const result=await Wishlist.updateOne({userId},{$pull:{items:{productId}}})

        if(result.modifiedCount===0){
            return res.status(404).json({message:"Can not find the product in the wishlist"})
        }
        const updatedWishlist=await Wishlist.findOne({userId})
        res.status(200).json({message:"Product removed from the wishlist",wishlist:updatedWishlist})

    }catch(error){
      return res.status(500).json({message:"Error removing product from wishlist"})
    }
 }

 const clearWishlist=async (req,res)=>{
  
    try{
      const userId=req.params.id;
      if(!userId){
        return res.status(404).json({message:"User not found "})
      }
     const wishlist=await Wishlist.findOneAndUpdate({userId},{items:[]},{new:true})
     if(!wishlist){
      return res.status(404).json({message:"Wishlist not found"})
     }
     res.status(200).json({message:"Wishlist cleared successfully"})
    }catch(error){
     res.status(500).json({message:"Error clearing wishList",error:error.message})
    }
  }
  
 export {addToWishList,fetchWishList,removeFromWishlist,clearWishlist}