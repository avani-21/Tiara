import express from "express";
const router = express.Router();
import {
  signin,
  signup,
  googleSignin,
  verifyOtp,
  resendOtp,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword,
} from "../../Backend/controllers/userController.js";
import {
  fetchProduct,
  getSingleProduct,
} from "../controllers/productController.js";
import { getProfile } from "../../Backend/controllers/userController.js";
import verifyToken from "../middleware/verifyTokenMiddleware.js";
import {
  addAddress,
  deleteAddress,
  fetchAddress,
  fetchDefaultAddress,
  updatedAddress,
} from "../controllers/addressController.js";
import {
  addToCart,
  clearCart,
  decreaseQuantity,
  getCart,
  increaseQuantity,
  removeFromCart,
} from "../controllers/cartController.js";
import {
  getUserOrders,
  placeOrder,
  cancelOrder,
  returnPayment,
  handlePaymentStatus,
} from "../controllers/orderController.js";
import { createTransaction, retryPayment } from "../controllers/paymentController.js";
import {
  addToWishList,
  clearWishlist,
  fetchWishList,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { addMoney, getWallet, updateWallet, walletTransaction } from "../controllers/walletController.js";
import { applyCoupen, getCoupon } from "../controllers/coupenController.js";
import { getCategory, } from "../controllers/categoryController.js";
import requireRole from "../middleware/requireRole.js";
import checkBlockedUser from "../middleware/checkBlockedUser.js";


router.post("/signin", signin);
router.post("/signup", signup);
router.post("/google-signin", googleSignin);
router.post("/otp-verification", verifyOtp);
router.post("/resend-otp", resendOtp);

router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

router.get("/product", fetchProduct);
router.get("/single-product/:id", getSingleProduct);

router.get("/category",getCategory)

router.get("/profile/:id", verifyToken,requireRole("user"), checkBlockedUser,getProfile);
router.put("/profile/:id", verifyToken, requireRole("user"), checkBlockedUser,updateProfile);
router.patch("/profile/:id", verifyToken, requireRole("user"), checkBlockedUser,changePassword);

router.get("/address/:id", verifyToken, requireRole("user"), checkBlockedUser,fetchAddress);
router.post("/address/:id", verifyToken, requireRole("user"),addAddress);
router.put("/address/:id", verifyToken, requireRole("user"),updatedAddress);
router.delete("/address/:id", verifyToken, requireRole("user"),deleteAddress);
router.get("/address/defaultAddress/:id", verifyToken, requireRole("user"),fetchDefaultAddress);

router.get("/cart/:id", verifyToken, requireRole("user"), checkBlockedUser,getCart);
router.post("/cart/:id", verifyToken, requireRole("user"), checkBlockedUser,addToCart);
router.delete("/cart/:userId/:productId", verifyToken, requireRole("user"), checkBlockedUser,removeFromCart);
router.patch(
  "/cart/:userId/increase/:productId",
  verifyToken,
  requireRole("user"),
  checkBlockedUser,
  increaseQuantity
);
router.patch(
  "/cart/:userId/decrease/:productId",
  verifyToken,
  requireRole("user"),
  checkBlockedUser,
  decreaseQuantity
);
router.post("/cart/clear-cart/:id", verifyToken,requireRole("user"),  checkBlockedUser,clearCart);

router.post("/place-order", verifyToken, requireRole("user"),checkBlockedUser,placeOrder);
router.get("/order/order-details/:id", verifyToken, requireRole("user"),checkBlockedUser,getUserOrders);
router.patch(
  "/order/cancel-order/:userId/:orderId/:productId",
  verifyToken,
  requireRole("user"),
  checkBlockedUser,
  cancelOrder
);

router.patch("/order/return/:userId/:orderId/:productId",verifyToken,requireRole("user"),checkBlockedUser,returnPayment)
router.post("/order/change-payment-status",handlePaymentStatus)
router.post("/order/retry-payment",retryPayment)

router.post("/order/createTransaction", verifyToken, requireRole("user"),createTransaction);
router.get("/wallet/:id", verifyToken,requireRole("user"), checkBlockedUser,getWallet);
router.post("/wallet/add/:id", verifyToken, requireRole("user"),checkBlockedUser,addMoney);
router.post("/wallet/trasaction",verifyToken,requireRole("user"),checkBlockedUser,walletTransaction)
router.post("/wallet/update-wallet",verifyToken,requireRole("user"),checkBlockedUser,updateWallet)

router.get("/wishlist/:id", verifyToken, requireRole("user"),checkBlockedUser,fetchWishList);
router.post("/wishlist/:id", verifyToken, requireRole("user"),checkBlockedUser,addToWishList);
router.delete("/wishlist/:userId/:productId", verifyToken,requireRole("user"), checkBlockedUser,removeFromWishlist);
router.post("/wishlist/clear-wishlist/:id", verifyToken,requireRole("user"),checkBlockedUser, clearWishlist);
 
router.get('/coupon',verifyToken,getCoupon)
router.post('/coupon/apply-coupon/:id',verifyToken,requireRole("user"),checkBlockedUser,applyCoupen)


export default router;
