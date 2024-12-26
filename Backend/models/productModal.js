import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice:{
      type: Number,
      default:0
    },
    offerPrice:{
      type: Number,
      default:0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default:0,
      min:0
    },
    images: {
      type: [String], 
      validate: {
        validator: function (value) {
          return value.length >= 3; 
        },
        message: "At least 3 images are required",
      },
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    isListed: {
      type: Boolean,
      default: false,
    },
    isPopular:{
      type:Number,
      default:0
    },
    offerApplied:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Offer"
    }]
  },
  { timestamps: true } 
);


const Product = mongoose.model("Product", productSchema);

export default Product;
