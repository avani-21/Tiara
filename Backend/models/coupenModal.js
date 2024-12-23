import mongoose from 'mongoose'

const coupenSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true,
    },
    discountType: {
        type: String, 
        enum: ["percentage", "fixed"], 
        required: true
    },
    minPurchase: {
        type: Number,
        required: true,
    },
    maxDiscount:{
        type:Number,
        default:1,
    },
    maxUsage: { 
        type: Number, 
        default: 1,
        max:1,
     },
    expiresAt: {
        type: Date,
        required: true,
    },
   userData:[
      {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
          },
         usageCount:{
          type:Number,
          default:1,
          max:1,
         }
      }
   ],
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true })

const Coupen = mongoose.model("Coupen", coupenSchema)
export default Coupen;