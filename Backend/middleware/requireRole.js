const requireRole=(role)=>{
    return (req,res,next)=>{
        if(!req.user){
         return res.status(401).json({message:"Unauthorized:User info not fount"})
        }
        if(req.user.role!== role){
            return res.status(403).json({message:`Forbidden: Only ${role}'s are allowed to access`})
        }

        next();
    }
}

export default requireRole;