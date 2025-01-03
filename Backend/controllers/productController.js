 import Product from "../models/productModal.js"
 import fs from 'fs';
 import path from 'path';
 import Category from "../models/categoryModal.js";
 import Offer from "../models/offerModal.js";
import Order from "../models/OrderModal.js";
import { cloudinary } from "../cloudinary/cloudinary.js"
import {v4 as uuidv4} from "uuid"


const uploadImageToCloudinary = async (filePath) => {
  const options = {
    folder: "products",
    public_id: uuidv4(),
    use_filename: true, 
  };

  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    return result.secure_url; 
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
};


const fetchProduct = async (req, res) => {
    try {
      console.log("jdjnhf",req.query.sort)
      const sort = req.query.sort || 'createdAt';
      const category = req.query.category || null;
      const search = req.query.searchQuery;
  
      const queryCondition = { isListed: true };
  
      if (category && category !== 'All') {
        const categoryArray = category.split(',');
        queryCondition.category = { $in: categoryArray };
      }
  
      if (search) {
        queryCondition.name = { $regex: search, $options: "i" };
      }
  
      let sortCondition = {};
      switch (sort) {
        case 'popularity':
          sortCondition = { isPopular: -1 };
          break;
        case 'priceLowToHigh':
          sortCondition = { offerPrice: 1 };
          break;
        case 'priceHighToLow':
          sortCondition = { offerPrice: -1 };
          break;
        case 'newArrivals':
          sortCondition = { createdAt: -1 };
          break;
        case 'aToZ':
          sortCondition = { name: 1 };
          break;
        case 'zToA':
          sortCondition = { name: -1 };
          break;
        default:
          sortCondition = { createdAt: -1 };
      }
  
      const allProduct = await Product.find(queryCondition)
        .populate('category')
        .sort(sortCondition);
  
      const activeOffers = await Offer.find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        categories: { $in: allProduct.map(product => product.category._id) }
      });
  
      const allProductWithOffers = allProduct.map(async (product) => {
        const applicableCategoryOffers = activeOffers.filter(offer =>
          offer.categories.includes(product.category._id)
        );
      

        let offerPrice = product.price;
        if (product.offers && product.offers.length > 0) {
          product.offers.forEach(offer => {
            const discount = offer.discountType === 'percentage'
              ? offer.discountValue / 100 * offerPrice
              : offer.discountValue;
            offerPrice -= discount;
          });
        }
  
        applicableCategoryOffers.forEach(offer => {
          const discount = offer.discountType === 'percentage'
            ? offer.discountValue / 100 * offerPrice
            : offer.discountValue;
  
          offerPrice -= discount;
        });
  
        product.offerPrice = Math.max(offerPrice, 0);
  
     
        await product.save();
  
        return product;
      });
  
      // Wait for all products to be updated
      const updatedProducts = await Promise.all(allProductWithOffers);
  
      res.status(200).json({ message: 'Product fetched successfully', allProductWithOffers: updatedProducts });
  
    } catch (error) {
      console.log("Error fetching products:", error);
      res.status(500).json({ message: 'Error fetching products', error });
    }
  };
  

const fetchProductForAdmin=async (req,res)=>{
    try{
        const allProduct=await Product.find().populate('category')
        res.status(200).json({Message:'product fetched ',allProduct})
    }catch(error){
    res.status(500).json({message:"Error fetching data",error})
    }
}
  
const getSingleProduct=async (req,res)=>{
    const id=req.params.id;
    try{
        const singleProduct=await Product.findById({_id:id}).populate('category')
        if(!singleProduct){
            return res.status(404).json({message:'Product not found'})
        }
      console.log(singleProduct);
      await Product.findByIdAndUpdate(id,{$inc:{isPopular:1}})
      
        const reletedProducts=await Product.find({category:singleProduct.category,_id:{$ne:id}}).limit(3)
        res.status(200).json({message:"Product Found",singleProduct,reletedProducts})
    }catch(error){
        console.log(error.message)
        res.status(500).json({message:"Error while fetching product data"})
    }
}

const addProduct=async (req,res)=>{
        try{
            const {name,description,price,category:categoryName,stock,discount,isListed}=req.body
            const images = req.files ? req.files.map(file => file.path) : null;
            if (!images || images.length === 0) {
                return res.status(400).json({ message: "Images are required" });
              }
            if(!name || !description || !price || !categoryName || !stock || !images){
                toast.error('All flelds are required');
                return res.status(400).json({message:"All  required field must be filled"})

            }
            const category = await Category.findOne({ name: categoryName });
            if (!category) {
                return res.status(400).json({ message: "Category not found" });
            }

            const existingProduct = await Product.findOne({ name: name });
            if (existingProduct) {
              return res.status(400).json({ message: "Product with this name already exists." });
            }
           

           const imageUrls = await Promise.all(images.map(async (image) => {
            const uploadedImage = await uploadImageToCloudinary(image); 
            return uploadedImage; 
          }));

            const newProduct=new Product({
                name,
                description,
                price,
                category:category._id,
                stock,
                images: imageUrls, 
                discount,
                isListed,
                createdAt:new Date()
            })

            
        const response =await newProduct.save();
        res.status(200).json({message:"Product created successfully",product:response})
        }catch(error){
            console.log(error.message)
            res.status(500).json({message:"Error creating product"})
        }
    }   
    



const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { removedImages, images } = req.body;
    let newImages = [];

    
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }



 
    if (removedImages) {
      const removedImagesArray = JSON.parse(removedImages);


      newImages = currentProduct.images.filter((image) => !removedImagesArray.includes(image));

      removedImagesArray.forEach(async (imageUrl) => {
        const publicId = imageUrl.split('/').pop().split('.')[0]; 
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      });
    }

   
    if (req.files && req.files.length > 0) {
      const newImagePaths = await Promise.all(req.files.map(async (file) => {
        const uploadResult = await uploadImageToCloudinary(file.path); 
        return uploadResult;  
      }));
      newImages = [...newImages, ...newImagePaths];
    }

  
    if (newImages.length < 3) {
      return res.status(400).json({ message: "At least 3 images are required." });
    }

 
    const updatedProduct = await Product.findByIdAndUpdate(productId, { ...req.body, images: newImages }, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
};

    

const ListProduct=async (req,res)=>{
    try{
        const productId=req.params.id;
        console.log(productId)
        const response=await Product.findByIdAndUpdate(productId,{isListed:true},{new:true})
        console.log(response);
        
        if(!response){
            return res.status(404).json({message:"Product not found"})
        }
        res.status(200).json({message:"Product listed successfully",product:response})
    }catch(error){
        console.log(error.message)
        res.status(500).json({message:"Error occured during product listing"})
    }
   
}

const unListProduct=async (req,res)=>{
    try{
        const productId=req.params.id;
        console.log(productId);
        
        const response=await Product.findByIdAndUpdate(productId,{isListed:false},{new:true})
        console.log(response);
        
        if(!response){
           return res.status(404).json({message:'product not found'})
        }
        res.status(200).json({message:"Product Unlisted successfully",product:response})
    }catch(error){
        console.log(error.message)
        toast.error('Error occured during unlisting')
        res.status(500).json({message:"Error occured during unlisting"})
    }
    
}

const getTopSellingProduct=async (req,res)=>{
  try{
   const toProduct=await Order.aggregate([
    {$unwind:"$orderItems"},
    {
      $group:{
        _id: { $toObjectId: "$orderItems.productId" },
        totalQuantitySold:{$sum:"$orderItems.quantity"}
      }
    },
    {$sort:{totalQuantitySold:-1}},
    {$limit:5}
   ])
   const products=toProduct.map((product)=>product._id);
   const product=await Product.find({_id:{$in:products}})
   .select("name price category images")
   .lean()
   
  const populatedProducts = toProduct.map((topProduct) => {
    const foundProduct = product.find(
      (p) => p._id.toString() === topProduct._id.toString()
    );

    return {
      name: foundProduct?.name,
      price: foundProduct?.price,
      category: foundProduct?.category,
      images: foundProduct?.images[0],
      totalQuantitySold: topProduct.totalQuantitySold
    };
  });

   res.status(200).json({message:"Top selled products",products:populatedProducts})
  }catch(error){
    console.log(error);
    res.status(500).json({message:"Failed to fetch top selling products",error})
  }
}


    
export {fetchProduct,getSingleProduct,editProduct,addProduct,ListProduct,unListProduct,fetchProductForAdmin,getTopSellingProduct}

    

   
