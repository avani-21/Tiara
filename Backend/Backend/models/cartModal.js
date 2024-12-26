import mongoose from "mongoose";
 
const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [ 
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
                required: true,
            },
            price:{
                type:Number,
                required:true
            },
            offerPrice:{
                type:Number
            }
        },
    ],
    coupon: {
        code: {
             type: String 
            },
        discount: { 
            type: Number, 
            default: 0 
        },
        minPurchase:{
            type:Number
        }
      },
},
{timestamps: true });

const Cart = mongoose.model('cart', cartSchema);
export default Cart;
