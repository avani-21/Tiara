import mongoose from "mongoose";


const addressSchema =new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    fullname:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
    },
    street:{
        type:String,
        required:true
    },
    village:{
        type:String
    },
    country:{
     type:String,
     required:true
    },
    pincode:{
        type:String,
        required:true
    },
    defaultAddress:{
        type:Boolean,
        default:false
    }

},
{timestamps:true})

const Address=mongoose.model('address',addressSchema)
export default Address;