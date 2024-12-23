import mongoose from "mongoose";

const adminschem=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})

const adminSchem=mongoose.model('Admin',adminschem)
export default adminSchem ;