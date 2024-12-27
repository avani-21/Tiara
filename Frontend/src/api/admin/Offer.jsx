import axios from "axios"
import { toast } from "react-toastify"

const API_URL=`/api/admin/offer`

const createOffer=async (offerData)=>{
    try{
      const token=localStorage.getItem('adminToken')
  
      const response=await axiosInstance.post(`${API_URL}/create`,offerData,{
          headers:{
              Authorization:`Bearer ${token}`
          }
      })
      if(response.status===200){
          toast.success("Offer created successfully")
        return response.data.offer
      }
    }catch(error){
     console.log("Offer error",error)
     toast.error(error.response?.data?.message || 'Failed to add coupon');
  }
  
  }

  const getOffer=async ()=>{
    try{
    const token=localStorage.getItem("adminToken")
    const response =await axiosInstance.get(`${API_URL}`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    if(response.status===200){
      return response?.data?.offer
    }
    }catch(error){
     toast.error(error.response?.data?.message)
    }
  }

  const deActivate=async (offerId)=>{
    try{
      const token=localStorage.getItem("adminToken")
      const response=await axiosInstance.patch(`${API_URL}/toggle-status/${offerId}`,{},{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      if(response){
        return response.data
      }
    }catch(error){
      toast.error(error.response?.data?.message)
    }
  }
 const editOffer=async (offerId,offerData)=>{
  const token=localStorage.getItem("adminToken")
  try{
    const response=await axiosInstance.put(`${API_URL}/edit-offer/${offerId}`,offerData,{
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
  

  export {createOffer,getOffer,deActivate,editOffer}