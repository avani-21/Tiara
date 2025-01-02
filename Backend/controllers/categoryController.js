import { toast } from "react-toastify";
import categorySchema from "../models/categoryModal.js";
import Order from '../models/OrderModal.js'
import Product from "../models/productModal.js";

const getCategory = async (req, res) => {
  try {
    const categories = await categorySchema.find({});
    res.status(200).json({ message: "Category data fetched", categories });
  } catch (error) {
    res.status(500).json({ message: "Error fetching category data" });
  }
};

const addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const existingCategory = await categorySchema.findOne({ name : { $regex: `^${name}$`, $options: 'i' }});
    if (existingCategory) {
      toast.error("Category name already exist");
      return res.status(400).json({ message: "Category alredy exist" });
    }

    const newCategory = new categorySchema({ name });
    await newCategory.save();
    res
      .status(200)
      .json({ message: "Category created Successfuly", category: newCategory });
  } catch (error) {
    console.log(error.message || "Failed t add category");
    return res.status(500).json({ message: "error adding category" });
  }
};

const editCategory = async (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;

  try {
    const existingCategory = await categorySchema.findOne({ name });
    if (existingCategory) {
     
      return res.status(400).json({ message: "Category alredy exist" });
    }

    const updateCategory = await categorySchema.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true }
    );
    if (!updateCategory) {
      return res.status(404).json({ message: "category not found" });
    }
    res
      .status(200)
      .json({ message: "updated category successfully", updateCategory });
  } catch (error) {
    console.error(error.message || "Error occurred updating category");
    return res.status(500).json({ message: "Error occured updating" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id=req.params.id;
     
    const category=await categorySchema.findById(id)
    if(!category){
      res.status(404).json({message:'Category not found'})
    }
    category.isListed=!category.isListed

    await Product.updateMany({category:id},{isListed:category.isListed})
    await category.save();
    res.status(200).json({message:"Category status changed successfully",category})

  } catch (error) {
    console.error("Error while unlisting category and products:", error.message);
    res.status(500).json({ message: "Failed to delete category" ,error});
  }
};

const getTopSellingCategory=async (req,res)=>{
  try{

    const topCategory=await Order.aggregate([
      {$unwind:"$orderItems"},
      {
        $lookup:{
          from:"products",
          localField:"orderItems.productId",
          foreignField:"_id",
          as:"productDetails"
        }
      },
      {$unwind:"$productDetails"},
      {
        $group:{
          _id:"$productDetails.category",
          totalQuantitySold:{$sum :"$orderItems.quantity"}
        }
      },
      {$sort:{totalQuantitySold:-1}},
      {$limit: 3},
    ])
    res.status(200).json({message:'Top selling categories ',categories:topCategory})
  }catch(error){
    console.log(error);
    res.status(500).json({message:"Internal server error",error})
  }
}



export { getCategory, addCategory, editCategory, deleteCategory,getTopSellingCategory };
