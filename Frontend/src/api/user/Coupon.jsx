import axios from "axios"
import {toast} from 'react-toastify'

const API_URL="/api/user/coupon"



const getCoupon=async ()=>{
    const token=localStorage.getItem("userToken") 
    try{
    const response=await axios.get(`${API_URL}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    if(response.status===200){
        return response.data.coupen
    }
    }catch(error){
      console.log("Error getting coupen:",error)
    }
}

const applyCoupon=async ()=>{
    const token=localStorage.getItem("userToken")
    const userId=localStorage.getItem("userId")
    try{
     const response=await axios.post(`${API_URL}/apply-coupon/${userId}`,{code:couponCode},{
        headers:{
            Authorization:`Bearer ${token}`
        }
     });
     console.log(response)
      if(response.status===200){
        return response.data;
      }
    }catch(error){
        console.log(error )
      toast.error(error?.response?.data?.message )
    }
}



export {applyCoupon,getCoupon}