import userSchema from "../../Backend/models/userModel.js";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import Wallet from "../models/WalletModal.js";
import { type } from "os";
import { Spinner } from 'react-bootstrap';

dotenv.config();

const emailSend = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email send to ", to);
  } catch (error) {
    console.log("Error dending mail", error);
  }
};

const signup = async (req, res) => {
  try {
    const { username, email, password ,refferalCode} = req.body;

    const user = await userSchema.findOne({ email });
    if (user) {
      // return res.status(400).json({ message: "User already exists" });
      if(!user.isVerified){
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp=otp;
        user.otpExpires= Date.now() + 1 * 60 * 1000;

        await user.save();
        await emailSend(email, "Verify your email", `Your OTP code is: ${otp}`);
        return res.status(200).json({message:"OTP send to your email",user})
      }else{
        return res.status(400).json({message:"User already exist"})
      }
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const generateRefferalCode=Math.random().toString(36).slice(2,8).toUpperCase();

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(otp);
    
    const walletBonusForNewUser = 25;
    const refferWalletBonus=50

    let reffer=null
    if(refferalCode){
     reffer=await userSchema.findOne({referalCode:refferalCode})
    }
    if(refferalCode && !reffer){
      return res.status(404).json({message:"Invalid referal code"})
    }

    const newUser = new userSchema({
      username,
      email,
      password: hashedPassword,
      otp: otp,
      otpExpires: Date.now() + 1 * 60 * 1000,
      referalCode:generateRefferalCode,
      refferedBy:reffer ? reffer._id :null,
      isVerified:false
    });


    await newUser.save();

    const newWallet = new Wallet({
      userId: newUser._id,
      balance: refferalCode ? walletBonusForNewUser : 0,
      transactions:refferalCode ? [
        {
          type:"credit",
          amount:walletBonusForNewUser,
          description: "Welcome bonus for signing up using referral code",
          
        } 
      ]: []
    });

    await newWallet.save();
    if (reffer) {
      const referrerWallet = await Wallet.findOneAndUpdate(
        { userId: reffer._id },
        {
          $inc: { balance: refferWalletBonus },
          $push: {
            transactions: {
              type: "credit",
              amount: refferWalletBonus,
              description: `Referral bonus for referring ${newUser.username}`,
            },
          },
        },
        { new: true, upsert: true } 
      );
    }
    
    await emailSend(
      email,
      "verify your email",
      `Your otp code is :${newUser.otp}`
    );

    res.status(200).json({ message: "OTP sent to your email", newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { emailObj, otp } = req.body;

  try {
    const user = await userSchema.findOne({ email: emailObj }).populate("otp");


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETKEY, {
      expiresIn: "7d",
    });
    res.status(200).json({
      success: true,
      message: "User Registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Received request to resend OTP:", req.body);

  try {
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(otp);
    user.otp = otp;
    user.otpExpires = Date.now() + 1 * 60 * 1000;

    await user.save();

    await emailSend(email, "Verify your email,Resend otp", `Your OTP code is: ${otp}`);

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email.",
      otpExpiry: user.otpExpires,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userSchema.findOne({ email });
    console.log(user);
    
    if (!user) {
      return res.status(400).json({ message: "user does not exists" });
    }
    if (user.isBlocked) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if(!user.isVerified){
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isValidPassword = bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Inavalid credential" });
    }

    const token = jwt.sign(
        {  id: user._id,
         email: user.email,
         role:"user"
         },
      process.env.JWT_SECRETKEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      mesage: "user Logined successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).status({ message: "Server error" });
  }
};

const googleSignin = async (req, res) => {
  try {
    const { email, googleId, displayName } = req.body;
    console.log(req.body);
    if (!googleId) {
      return res.status(400).json({ message: "Google ID is required" });
    }
    console.log(2);
    

    let user = await userSchema.findOne({ email });
    console.log(user);
    const generateRefferalCode=Math.random().toString(36).slice(2,8).toUpperCase();

    if (!user) {
      user = new userSchema({
        email,
        googleId,
        username: displayName,
        referalCode:generateRefferalCode,
        password: "google",
      });
      console.log(user);
      const response = await user.save();
      console.log(response);
    } else {
      user.googleId = googleId;
      await user.save();
    }
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({
        userId: user._id,
        balance: 0, 
      });
      await wallet.save();
    }
    

    const token = jwt.sign(
      { id: user._id, email: user.email , role:"user"},
      process.env.JWT_SECRETKEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "User logged in successfully with Google",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  try {
    const user = await userSchema.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User profile get successfully", user });
  } catch (error) {
    console.log("Error getting profile data", error);
    res.status(500).json({ message: "Error fetching Profile data" });
  }
};

const updateProfile = async (req, res) => {
  const id = req.params.id;

  const { username, email } = req.body;
  try {
    const user = await userSchema.findByIdAndUpdate(
      { _id: id },
      { username, email },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.log("error profile updating", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

const changePassword = async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error updating password:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userSchema.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 1 * 60 * 1000;
    console.log(otp);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    await emailSend(email, "Password rest otp", `otp code is ${otp}`);
    res.status(200).json({ message: "OTP send to your mail" });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Server error" });
  }
};
const resetPassword = async (req, res) => {
  try {
    let { email, password, confirmPassword } = req.body;
    

    if (typeof email === "string" && email.startsWith("{")) {
      email = JSON.parse(email).email;
    }
   

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await userSchema.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('user: ',user);

    const hashedPassword = bcryptjs.hashSync(password, 20);
    user.password = hashedPassword;
    console.log("dsdfsf", user.password);
    await user.save();
    res
      .status(200)
      .json({ message: "Password reset successfully. Please log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export {
  signup,
  signin,
  googleSignin,
  resendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword,
};

