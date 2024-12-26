import mongoose from "mongoose";

const userschema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: 'uploads/profile.jpg',
    },
    referalCode:{
    type:String,
    unique:true
    },
    refferedBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      default:null
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ], 
   wallet:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Wallet"
   } 
  },
  { timestamps: true }
);

const User = mongoose.model('User', userschema);
export default User;
