import User from "../../Backend/models/userModel.js";
import Wallet from "../models/WalletModal.js";
import Razorpay from 'razorpay';
import order from "../models/OrderModal.js"
import razorpay from "../razorpay/razorpay.js";

const getWallet = async (req, res) => {
  try {
    const userId = req.params.id;
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    

    const sortedTransactions = wallet.transactions.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    const updatedWallet = {
      ...wallet.toObject(), 
      transactions: sortedTransactions
    };

    res.status(200).json({ message: "Wallet found", wallet: updatedWallet });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// const addMoney = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const userId = req.user.id;
    
//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: "Invalid amount" });
//     }

//     const orderOption={
//       amount:amount*100,
//       currency:"INR",
//       receipt: `order_${new Date().getTime()}`,
//     }

//     const razorpayOrder=await razorpay.orders.create(orderOption)


//     if (!razorpayOrder) {
//       return res.status(500).json({ message: "Error creating Razorpay order" });
//     }

//     if(razorpayOrder){
//       res.status(200).json({
//         message:"Success",
//         orderId: razorpayOrder.id,
//         amount: razorpayOrder.amount / 100,
//       });
//     }

    

//     const wallet = await Wallet.findOne({ userId });
//     if (!wallet) {
//       return res.status(404).json({ message: "Wallet not found" });
//     }
//     wallet.balance += amount;
//     wallet.transactions.push({
//       type:"credit",
//       amount,
//       description:"Added money to wallet",
//     })
//     await wallet.save();

//     // res.status(200).json({ message: "Money added successfully", wallet });
//   } catch (error) {
//     console.error("Error adding money to wallet:", error);
//     res.status(500).json({ message: "Server error",error});
//   }
// };

const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Razorpay order creation
    const orderOption = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `order_${new Date().getTime()}`,
    };

    const razorpayOrder = await razorpay.orders.create(orderOption);

    if (!razorpayOrder) {
      return res.status(500).json({ message: "Error creating Razorpay order" });
    }

    // Send orderId and amount back to frontend to open Razorpay modal
    res.status(200).json({
      message: "Success",
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount / 100, // Convert amount back to INR
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    console.log(req.body);
    

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

  
    wallet.balance += amount;
    wallet.transactions.push({
      type: "credit",
      amount,
      description: "Added money to wallet",
    });

    await wallet.save();

    res.status(200).json({message: "Wallet updated successfully",wallet });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ message: "Error updating wallet", error });
  }
};


const walletTransaction=async (req,res)=>{
  try{
  const {userId,amount}=req.body
  const user=await User.find({userId})
  if(!user){
   return res.status(404).json({message:"User not found"})
  }
  let wallet = await Wallet.findOne({userId:userId});
  if (!wallet) {
    wallet = new Wallet({ userId: userId });
    await wallet.save();
}

const shippingCharge = 100; 
const walletBalance = wallet.balance;
const totalAmountRequired = amount + shippingCharge; 
const remainingBalance = totalAmountRequired - walletBalance;


if(remainingBalance>0){
  return res.status(400).json({
     status:"insufficient",
     walletBalance,
     remainingBalance,
     message: `Your wallet has ₹${walletBalance}. You need ₹${remainingBalance} more to complete the transaction.`,
  })
}else{
  wallet.balance-=amount
  wallet.transactions.push({
    type:"debit",
    amount:amount,
    description:"Purchase of product"
  })
  await wallet.save()
  return res.status(200).json({
    message:"Transaction successfully",wallet
  })
}

  }catch(error){
    console.log(error);
    res.status(500).json({message:"Internal server error",error})
    
  }
}

export { getWallet, addMoney, walletTransaction, updateWallet};
