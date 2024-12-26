import User from '../models/userModel.js'

const checkBlockedUser=async (req,res,next)=>{
  try {
    const userId=req.user.id;
    const user=await User.findById(userId)

    if(!user){
        return res.status(404).json({message:"User not fount"})
    }
    if(user.isBlocked){
        return res.status(403).json({message:'Your account is blocked. Please contact support.'})
    }
    next()
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"An error occurred while checking user status"})
  }
}

export default checkBlockedUser;