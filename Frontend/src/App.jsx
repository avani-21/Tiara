import { useState } from "react";

import { Routes, Route, Router } from "react-router-dom";

import Login from "./pages/admin/Login/Login";
import UserLogin from "../src/pages/user/Login/Login";
import UserSignup from "./pages/user/Sign up/Signup";
import Home from "./pages/user/Home/Home";
import User from "../src/pages/admin/userMannagment/UserManagment";
import CategoryMangment from "../src/pages/admin/CategoryManagment/CategoryMangment";
import Shop from "../src/pages/user/Shop";
import Product from "./pages/user/Product";
import Otp from "../src/pages/user/Otp";
import ProductManagement from "./pages/admin/ProductManagment/ProductManagment";
import PrivateRouteAdmin from "../src/admin components/AdminPrivateRoute";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import Profile from "./pages/user/Profile/Profile";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Add from "../src/pages/user/checkOut/CheckOut";
import AddressCards from "../src/components/Address/Address";
import Cart from "../src/pages/user/Cart/Cart";
import OrderDetails from "../src/components/orderDetails/orderDetails";
import Order from "./pages/admin/OrderManagment/OrderManagment";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";
import OtpVerification from "./components/Emailverification/OtpVerificatio";
import ResetPassword from "./components/resetPassword/ResetPassword";
import PrivateRoute from "./components/userPrivateRoute";
import Wishlist from "./pages/user/Wishlist/Wishlist";
import Wallet from "./components/Wallet/Wallet";
import Coupen from '../src/pages/admin/Coupen/Coupen'
import Offer from "./pages/admin/OfferManagment/OfferManagment";
import SalesReport from "./pages/admin/salesReport/salesReport";
import OrderSuccess from "./components/orderSuccess/OrderSuccess";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import SingleOrderDetails from "./pages/admin/OrderManagment/singleOrderDetails";
import PublicRoute from "./components/userPublicRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/sign-up" element={<UserSignup />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<Product />} />
        <Route path="/otp" element={<Otp />} />

        <Route element={<PrivateRoute />}>
          <Route path="/pro/:id" element={<Profile />} />
          <Route path="/address" element={<AddressCards />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/car" element={<Add />} />
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>

        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-email" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/admin-login" element={<Login />} />
        <Route path="/coupen" element={<Coupen />} />
        <Route path="/offers" element={<Offer />} />
        <Route path="/sales-report" element={<SalesReport />} />
        <Route path="/success" element={<OrderSuccess />} />
        <Route path="/single-order/:orderId" element={<SingleOrderDetails />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/products"
          element={
            <PrivateRouteAdmin>
              <ProductManagement />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRouteAdmin>
              <CategoryMangment />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/user"
          element={
            <PrivateRouteAdmin>
              <User />
            </PrivateRouteAdmin>
          }
        />
        <Route
          path="/order"
          element={
            <PrivateRouteAdmin>
              <Order />
            </PrivateRouteAdmin>
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
