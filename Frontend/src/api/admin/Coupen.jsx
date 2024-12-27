import axios from "axios"
import { toast } from "react-toastify"

const API_URL='/api/admin/coupon'


const createCoupen=async (couponData)=>{
  try{
    const token=localStorage.getItem('adminToken')

    const response=await axiosInstance.post(`${API_URL}/create`,couponData,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    if(response.status===200){
        toast.success("Coupen created successfully")
      return response.data.coupon
    }
  }catch(error){
   console.log("coupen error",error)
   toast.error(error.response?.data?.message || 'Failed to add coupon');
}

}

const getCoupen=async ()=>{
    try{
        const token=localStorage.getItem('adminToken')
        const response=await axiosInstance.get(`${API_URL}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        console.log("Coupen:",response.data?.coupen);
        
        if(response.status===200){
            return response.data?.coupen
        }
    }catch(error){
       console.log(error)
    }
}

const editCoupon=async (id,couponData)=>{
 try{
    const token=localStorage.getItem("adminToken")
    const response= await axiosInstance.put(`${API_URL}/${id}`,couponData,{
      headers:{
          Authorization:`Bearer ${token}`
      }
    })
    if(response){
      return response.data
    }
 }catch(error){
    toast.error(error.response?.data?.message || "Something went wrong")
 }
}



const deleteCoupon=async (couponId)=>{
  const token=localStorage.getItem("adminToken")
  try{
    const response=await axiosInstance.patch(`${API_URL}/${couponId}`,{},{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    if(response.status===200){
      return response.data
    }
  }catch(error){
    toast.error(error.response?.data?.message)
  }
}


export {createCoupen,getCoupen,editCoupon,deleteCoupon}