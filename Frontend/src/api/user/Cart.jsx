import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = "/api/user/cart";
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("userToken");
console.log("user", userId);

const removeFromCart = async (productId) => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await axiosInstance.delete(`${API_URL}/${userId}/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("response", response);

    if (response.status === 200) {
      toast.success("Product removed from cart successfully");
      console.log(response);

      return response.data;
    }
  } catch (error) {
    console.log(error);
    toast.error("Failed to remove from cart.Try again");
  }
};

const clearCart = async () => {
  try {
    const token = localStorage.getItem("userToken");
    console.log(token, "token");

    const response = await axiosInstance.post(
      `${API_URL}/clear-cart/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("clear ", response);

    if (response.status === 200) {
      console.log("cart cleared");
    }
  } catch (error) {
    console.error("Cart clearing error:", error);
  }
};

const addToCart = async (productId, price, quantity,offerPrice) => {
  const token=localStorage.getItem('userToken')
  try {
    const response = await axiosInstance.post(
      `${API_URL}/${userId}`,
      {
        productId,
        price,
        quantity,
        offerPrice
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log("Error", error);
  }
};

export { removeFromCart, clearCart, addToCart };
