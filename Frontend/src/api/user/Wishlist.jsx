import axios from "axios"
import {toast} from 'react-toastify'

const API_URL='/api/user/wishlist'
const userId=localStorage.getItem('userId')
const token=localStorage.getItem('userToken')


const getWishlist=async ()=>{
    const token=localStorage.getItem('userToken')
 try{
    const response=await axios.get(`${API_URL}/${userId}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
      })
      console.log('wishlist',response.data.wishlist);
      if(response.status===200){
        return response.data.wishlist
      }
 }catch(error){
   console.log("Error",error)
 }
}

const addToWishlist=async (productId,quantity,price)=>{
    const token=localStorage.getItem('userToken')
try{
    const response=await axios.post(`${API_URL}/${userId}`,{productId,quantity,price},{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    if(response.status===200){
        toast.success("Product added to wishlist successfully")
        return response.data
    }
}catch(error){
    toast.error(error?.response?.data?.message)
}
}

const deleteFromWishlist=async (productId)=>{
    const token=localStorage.getItem('userToken')
    try{
       const response=await axios.delete(`${API_URL}/${userId}/${productId}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
       })
       console.log(response);
       
       if(response.status===200){
        return response.data
       }
    }catch(error){
      console.log("Error",error)
    }
}



export {getWishlist,addToWishlist,deleteFromWishlist}