import express from "express";
const router = express.Router();
import {
  blockUser,
  login,
  unblockUser,
} from "../../Backend/controllers/adminController.js";
import verifyToken from "../middleware/verifyTokenMiddleware.js";
import { fetchUser } from "../../Backend/controllers/adminController.js";
import {
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  addProduct,
  editProduct,
  fetchProductForAdmin,
  getSingleProduct,
  ListProduct,
  unListProduct,
} from "../../Backend/controllers/productController.js";
import { upload } from "../middleware/multerMiddleware.js";
import {
  cancelOrder,
  fetchAllOrderData,
  salesReport,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { createCoupen, deleteCoupen, editCoupen, getCoupon } from "../controllers/coupenController.js";
import { createOffer, deleteOffer, editOffer, getAllOffers } from "../controllers/offerController.js";
import { getTopSellingCategory } from "../controllers/categoryController.js";
import { getTopSellingProduct } from "../../Backend/controllers/productController.js";
import requireRole from "../middleware/requireRole.js";


router.post("/admin-login", login);

router.get("/users", verifyToken, requireRole("admin"),fetchUser);
router.patch("/users/:id/block", verifyToken,requireRole("admin"), blockUser);
router.patch("/users/:id/unblock", verifyToken,requireRole("admin"), unblockUser);

router.get("/product", verifyToken, requireRole("admin"),fetchProductForAdmin);
router.post("/product", verifyToken, requireRole("admin"),upload, addProduct);
router.get("/product/:id", verifyToken, getSingleProduct);
router.patch("/product/list/:id", verifyToken, requireRole("admin"),ListProduct);
router.patch("/product/unlist/:id", verifyToken, requireRole("admin"),unListProduct);
router.put("/product/:id", verifyToken, upload, requireRole("admin"),editProduct);

router.get("/categories", verifyToken, getCategory);
router.post("/categories", verifyToken, requireRole("admin"),addCategory);
router.put("/categories/:id", verifyToken, requireRole("admin"),editCategory);
router.patch("/categories/:id", verifyToken, requireRole("admin"),deleteCategory);

router.get("/order", verifyToken, fetchAllOrderData);
router.patch("/order/:id/status", verifyToken, requireRole("admin"),updateOrderStatus);

router.post("/coupon/create",verifyToken,requireRole("admin"),createCoupen)
router.get("/coupon",verifyToken,getCoupon)
router.put("/coupon/:id",verifyToken,requireRole("admin"),editCoupen)
router.patch("/coupon/:id",verifyToken,requireRole("admin"),deleteCoupen)

router.post("/offer/create",verifyToken,requireRole("admin"),createOffer)
router.get("/offer",verifyToken,getAllOffers)
router.put("/offer/edit-offer/:offerId",verifyToken,requireRole("admin"),editOffer)
router.patch("/offer/toggle-status/:offerId",verifyToken,requireRole("admin"),deleteOffer)


router.post("/sales-report",verifyToken,requireRole("admin"),salesReport)

router.get("/categories/top-catogories",verifyToken,requireRole("admin"),getTopSellingCategory)
router.get("/products/top-products",verifyToken,requireRole("admin"),getTopSellingProduct)


export default router;
