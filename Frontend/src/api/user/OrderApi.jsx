import axios from "axios"
import { toast } from "react-toastify"
const API_URL="/api/user/order"
const userId=localStorage.getItem('userId')


const fetchOrders=async ()=>{
    try{
        const token=localStorage.getItem('userToken')
        const response=await axios.get(`${API_URL}/order-details/${userId}`,{
            headers:{
            Authorization:`Bearer ${token}`
            }
        })
        console.log('order',response);
        
        if(response.status===200){
            return response.data.orders
        }else{
           console.log("Error occured while order fetching: ",response?.error?.message);  
        }
    }catch(error){
        console.log("Error Order:",error)
    }
}

const cancelOrder=async (productId,orderId,cancelRreason)=>{
    try{
        const token=localStorage.getItem("userToken")
        console.log('cancel order',token);
        
        const response = await axios.patch(`${API_URL}/cancel-order/${userId}/${orderId}/${productId}`, cancelRreason, {
           headers: {
             Authorization: `Bearer ${token}`
           }
        });
        
         
        if(response.status===200){
            toast.success("Order cancelled successfully")
            return response.data
        }
    }catch(error){
        toast.error(error?.response?.data?.message)
      console.log('cancel order error:',error)  
    }
}

const razorpayOrder=async (amount)=>{
 try{
    const token=localStorage.getItem("userToken")
    const response=await axios.post(`${API_URL}/createTransaction`,{amount,currency:"INR"},{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    console.log('response order',response);
    if(response.status===200){
        return response.data.order  
    }
 }catch(error){
    console.error("Error creating Razorpay order:", error);
 }
}

const returnOrder=async (productId,orderId,returnReason)=>{
 try{
    const userId=localStorage.getItem('userId')
    const token=localStorage.getItem("userToken")
    const response=await axios.patch(`${API_URL}/return/${userId}/${orderId}/${productId}`,returnReason,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
   if(response.status===200){
    toast.success("Order returned successfully")
    return response.data

   }
 }catch(error){
    toast.error(error?.response?.data?.message)
  console.log("return order error".error)
 }
}


 

export {fetchOrders,cancelOrder,razorpayOrder,returnOrder}