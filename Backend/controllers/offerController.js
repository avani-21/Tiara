import Category from "../models/categoryModal.js";
import Products from "../models/productModal.js";
import Offer from "../models/offerModal.js";
import { login } from "./adminController.js";
import Product from "../models/productModal.js";


const createOffer = async (req, res) => {
  try {
    const { name, categories, discountValue, products, discountType, startDate, endDate, isActive } = req.body;

    if (!name || !discountValue || !startDate || !endDate || !discountType || !products || !categories) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const numericDiscountValue = Number(discountValue);
    if (numericDiscountValue <= 0) {
      return res.status(400).json({ message: 'Discount value must be positive' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (new Date(endDate) < today) {
      return res.status(400).json({ message: "End date cannot be earlier than today" });
    }
    
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ message: "End date cannot be earlier than start date" });
  }


   if(numericDiscountValue >=30){
    return res.status(400).json({messaage:"Discount percentage can not be  more than 50%"})
   }
    
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    let isOfferActive = false;
    if (start.toDateString() === currentDate.toDateString()) {
      isOfferActive = true;
    }

    let applicableProducts = products;
    let applicableCategories = categories;

    if (products === "all" || (Array.isArray(products) && products.includes("all"))) {
      const allProducts = await Products.find({});
      applicableProducts = allProducts.map(product => product._id);
    } else if (!Array.isArray(products)) {
      applicableProducts = [products];
    }

    if (categories === "all" || (Array.isArray(categories) && categories.includes("all"))) {
      const allCategories = await Category.find({});
      applicableCategories = allCategories.map(category => category._id);
    } else if (!Array.isArray(categories)) {
      applicableCategories = [categories];
    }

    const offer = new Offer({
      name,
      categories: applicableCategories,
      discountValue: numericDiscountValue,
      products: applicableProducts,
      discountType,
      startDate,
      endDate,
      isActive: isOfferActive,
    });

    await offer.save();

    let productsToUpdate = [];
    if (applicableProducts.length > 0) {
      productsToUpdate = await Products.find({ _id: { $in: applicableProducts } });
    }
    if (applicableCategories.length > 0) {
      const productsInCategory = await Products.find({ category: { $in: applicableCategories } });
      productsToUpdate.push(...productsInCategory);
    }

    console.log(productsToUpdate);

    // Set offerPrice and apply the offer only if active
    for (const product of productsToUpdate) {
      let offerPrice;
      const productPrice = Number(product.price);

      if (discountType === 'percentage') {
        offerPrice = productPrice - (productPrice * (numericDiscountValue / 100));
      } else if (discountType === 'fixed') {
        offerPrice = productPrice - numericDiscountValue;
      }

      offerPrice = Math.max(offerPrice, 0);
    

      await Products.updateOne(
        { _id: product._id },
        {
          $set: { offerPrice },
          $addToSet: { offersApplied: offer._id },
        }
      );
    }

    res.status(200).json({ message: 'Offer created successfully', offer });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Error creating offer', error: error.message });
  }
};


const getAllOffers=async (req,res)=>{
  try{
    const offer=await Offer.find({}).populate('products','name').populate('categories','name')
  

   if(!offer){
    return res.status(404).json({message:"No offer is founded"})
   }
   console.log(offer)
   res.status(200).json({message:"All offers fetched successfully",offer})

  }catch(error){
    console.log(error)
    res.status(500).json({message:"failed to fetch offer data",error})
  }
}

const editOffer=async (req,res)=>{
  const offerId=req.params.offerId
  const {name,discountType,discountValue,startDate,endDate,isActive,categories,products}=req.body

  if (!name || !discountType || !discountValue || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if(discountValue>=50){
    return res.status(400).json({message:"Discount can not exceedd more than 50%"})
  }

  const today = new Date();
today.setHours(0, 0, 0, 0); 

  if (new Date(endDate) < today) {
    return res.status(400).json({ message: "End date cannot be earlier than today" });
  }

  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ message: "End date cannot be earlier than start date" });
  }



  try{
    const offer = await Offer.findByIdAndUpdate(
      offerId,
      { name, discountType, discountValue, startDate, endDate, isActive,categories,products },
      { new: true }
    );
   
     res.status(200).json({message:"Offer updated successfully",offer})
  }catch(error){
    res.status(500).json({message:"Error occured during eediting offer",error})
  }
}


const deleteOffer = async (req, res) => {
  const offerId = req.params.offerId;

  try {
    const offer = await Offer.findById(offerId).populate('products');
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

   
    offer.isActive = !offer.isActive;
    await offer.save();


    if (!offer.isActive) {
      await Product.updateMany(
        { offersApplied: offerId },
        {
          $pull: { offersApplied: offerId }
        }
      );
    } else {
      
     const productsWithOffer=await Product.find({
      offersApplied:{$ne :[]}
     })

     if (productsWithOffer.length > 0) {
      return res.status(400).json({
        message: 'An offer is already applied to some products. Please remove it before activating a new one.',
      });
    }

    await Product.updateMany(
      { offersApplied: { $ne: offerId } },
      { $push: { offersApplied: offerId } }
    );
    }

    res.status(200).json({
      message: offer.isActive ? 'Offer activated' : 'Offer deactivated',
      offer,
    });
  } catch (error) {
    console.error('Error handling offer activation/deactivation:', error);
    res.status(500).json({ message: 'Error handling offer activation/deactivation', error });
  }
};



export {createOffer,getAllOffers,editOffer,deleteOffer}