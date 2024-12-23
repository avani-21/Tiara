import Address from "../../Backend/models/addressModal.js";
import User from "../models/userModel.js";

const addAddress = async (req, res) => {
  const userId = req.params.id;
  console.log("Request Body:", req.body); // Log the incoming data

  try {
    // Ensure that all required fields are present
    const { fullname, phone, street, village, country, pincode, defaultAddress } = req.body;

    if (!fullname || !phone || !street || !village || !country || !pincode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAddress = new Address({
      fullname,
      phone,
      street,
      village,
      country,
      pincode,
      userId,
      defaultAddress: defaultAddress || false, // Default to false if not provided
    });

    // If the new address is marked as default, make others non-default
    if (defaultAddress === true) {
      await Address.updateMany({ userId }, { $set: { defaultAddress: false } });
    }

    // Save the new address to the database
    const savedAddress = await newAddress.save();
    res.status(200).json({ message: "Address added successfully", savedAddress });
  } catch (error) {
    console.error('Error adding address:', error.message); // Log the error message
    res.status(500).json({ message: "Error adding address", error: error.message });
  }
};

const fetchAddress=async (req,res)=>{
    const userId=req.params.id;
    try{
       const address=await Address.find({userId})
       if(!address){
        return res.status(404).json({message:"Address nt found"})
       }
       res.status(200).json({message:"Address data fetched successfully",address})
    }catch(error){
        console.log('error fetching address data',error)
      return res.status(500).json({message:"Error fetching address data"})
    }
}

const updatedAddress=async (req,res)=>{
   const addressId=req.params.id;
   try{
    const address= await Address.findByIdAndUpdate(addressId,req.body,{new:true})
     if(!address){
        return res.status(404).json({message:"Address not found"})
     }
     await address.save()
     res.status(200).json({message:"Address updated Successfully",address})
   }catch(error){
    console.log("Error updating address",error);
    
    return res.status(500).json({message:'Error fetching data'})
   }
}


const deleteAddress=async (req,res)=>{
    const addressId=req.params.id;
    try{
        const deletedAddress=await Address.findByIdAndDelete(addressId)
        if(!deletedAddress){
            return res.status(404).json({message:"Address not found"})
        }
        res.status(200).json({message:'Address deleted successfully'})
    }catch(error){
        console.log("Error deleting address",error)
        return res.status(500).json({message:"Error deleting message"})
    }
}

const fetchDefaultAddress= async (req,res)=>{
    const userId=req.params.id;
    try{

      const defaultAddress=await Address.findOne({userId,defaultAddress:true})
      if(!defaultAddress){
       return res.status(404).json({message:"Default not found"})
      }
      res.status(200).json({messsage:'Default address fetched successfully',defaultAddress})

    }catch(error){
        console.log('Error fetching default address',error);
        
        return res.status(500).json({message:"Error fetching default address"})
    }
}

export {addAddress,fetchAddress,updatedAddress,deleteAddress,fetchDefaultAddress}
