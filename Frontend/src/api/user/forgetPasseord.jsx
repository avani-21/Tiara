import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "/api/user";

const token = localStorage.getItem("userToken");

const forgetPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/forget-password`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      toast.success("OTP send to your email");
      return response.data;
    }
  } catch (error) {
    console.log("Forget password", error);
  }
};

const resetPassword = async (email, password, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, {
      email,
      password,
      confirmPassword,
    });
    console.log("response",response);
    
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log("Error", error);
    toast.error("Something went wrong.plese try again");
  }
};

export { forgetPassword, resetPassword };
