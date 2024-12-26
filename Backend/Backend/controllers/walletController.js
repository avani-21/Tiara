import User from "../../Backend/models/userModel.js";
import Wallet from "../models/WalletModal.js";

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


const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    wallet.balance += amount;
    wallet.transactions.push({
      type:"credit",
      amount,
      description:"Added money to wallet",
    })
    await wallet.save();

    res.status(200).json({ message: "Money added successfully", wallet });
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    res.status(500).json({ message: "Server error" });
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

export { getWallet , addMoney , walletTransaction};
