import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const API_URL = "/api/user/wallet";




const getWallet = async () => {
  const token = localStorage.getItem("userToken");
const userId = localStorage.getItem("userId");
  try {
    const response = await axiosInstance.get(`${API_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching wallet:", error);
    throw error;
  }
};

const addMoney = async (amount,navigate) => {
  const token = localStorage.getItem("userToken");
const userId = localStorage.getItem("userId");


  try {
    if (!token) {
      navigate('/login');
      return;
    }
    const response = await axiosInstance.post(
      `${API_URL}/add/${userId}`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', 

        },
      }
    );
    console.log(response);
    
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.error("Error adding money to wallet:", error);
  }
};

const walletTransaction=async (finalPrice)=>{
  const token = localStorage.getItem("userToken");
  const userId = localStorage.getItem("userId");
  console.log(finalPrice);
  

try{
  const response=await axiosInstance.post(`${API_URL}/trasaction`,{userId,amount:finalPrice},{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  if(response.status===200){
    return response.data
  }
}catch(error){
   console.log("Wallet trasaction error",error)
   toast.error(error?.response?.data?.message)
}
}

export { getWallet , addMoney, walletTransaction};
