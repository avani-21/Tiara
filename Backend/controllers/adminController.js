import adminSchem from '../../Backend/models/adminModal.js'
import userSchema from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'


const login=async (req,res)=>{
    try{
     const {email,password}=req.body;
     console.log(req.body)
     if(!email || !password){
        return res.status(400).json({message:"Email and Password is required"})
     } 
        const admin=await adminSchem.findOne({email})
        console.log(1);
        
        if(!admin){
            return res.status(400).json({message:'Admin not found'})
        }
        console.log(2);
        
       

        console.log(3);
        
        const isValidPassword=await bcryptjs.compare(password,admin.password)
        if(!isValidPassword){
            return res.status(400).json({message:'Invalid credentials'})
        }
        console.log(4);
        

        const token=jwt.sign({
            id:admin._id,
            email:admin.email ,
            role:"admin",
        },process.env.JWT_SECRETKEY,{expiresIn:'7d'})
         
        console.log(token);
         return res.status(200).json({message:"Admin login successfully",token})
     }catch(error){
         console.log("admin failed to login")
       return res.status(500).json({message:"Server error"})
     }
}

const fetchUser=async (req,res)=>{
      try{
        const users = await userSchema.find().sort({createdAt:-1});
        res.status(200).json({message:"User data fetched successfully", users})
      }catch(error){
   console.log(error);
   return res.status(500).json({message:"Error fetching data"})
      }
}

const blockUser=async (req,res)=>{
    try{
        const {id}=req.params;
        const response=await userSchema.findByIdAndUpdate(id,{isBlocked:true},{new:true})

        if(!response){
            return res.status(404).json({message:'user not found'})
        }
        res.status(200).json({message:'User blocked',response})
    }catch(error){
        console.log(error)
     res.status(500).json({message:"Failed to block user"})
    }
    
}

const unblockUser=async (req,res)=>{
    try{
        const userId=req.params.id
        const response=await userSchema.findByIdAndUpdate(userId,{isBlocked:false},{new:true})
        if(!response){
            return res.status(404).json({message:'User not found'})
        }
        res.status(200).json({message:'User unblocked',response})
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Faied to unblock user"})
    }
}


export {login,fetchUser,blockUser,unblockUser}