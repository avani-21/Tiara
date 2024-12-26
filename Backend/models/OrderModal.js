import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    paymentMethord: {
      type: String,
      enum: ["COD", "razorpay", "wallet"],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        "pending payment",
        "payment failed",
        "payment success"
      ],
      default: "pending",
    },
    orderSubtotal: {
      type: Number,
      required: true,
    },
    orderTotal: {
      type: Number,
    },
    razorId:{
      type:String,
      unique:true
    },
    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        itemStatus: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
            "returned",
            "pending payment",
            "payment failed",
            "payment success"
          ],
          default: "pending",
        },
      },
    ],
    shippingAddress: {
      phone: { type: Number, require: true },
      street: { type: String, required: true },
      village: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },
    discountValue:{
      type:Number,
      default:0,
     },
     minPurchase:{
      type:Number
     },
    coupon:{
     code:{
      type:String,
      default:null
     },
     discountType:{
      type:String,
      enum:["percentage","fixed"]
     },
    },
    reasons:{
     cancelReason:{
      type:String
     },
     returnReason:{
      type:String
     }
    },
  },

  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
