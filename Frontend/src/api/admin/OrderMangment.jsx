import axios from "axios"
import { toast } from "react-toastify"

const API_URL='/api/admin/order'
const token=localStorage.getItem('adminToken')
const userId=localStorage.getItem('userId')

const fetchOrderData=async (page,limit)=>{
    try{
       
        const response=await axiosInstance.get(`${API_URL}`,{
          params:{
            page,
            limit,
          },headers:{
            Authorization:`Bearer ${token}`
          }
      
    })
    console.log(response);
    
        if(response.status===200){
          console.log( response.data);
          
          return {
            orders: response.data.orders,
            totalOrders: response.data.totalOrders,
        };
        }
    } catch(error){
        console.log("Error occured while fetching orders",error)
    }
}

const statusUpdate=async (orderNumber,productId,newStatus)=>{
    try{
      const response=await axiosInstance.patch(`${API_URL}/${orderNumber}/status`,
        {
         status:newStatus,
         itemId:productId
      },{
        headers:{
     Authorization:`Bearer ${token}`
        }
      })

      if(response.status===200){
        console.log(response)
        toast.success("Order status updated successfully")
        return response.data
      }

    }catch(error){
        console.log('Response error',error)
    }
}

const cancelOrder=async (productId,orderId)=>{
    try{
        console.log('cancel order',token);
        
        const response = await axiosInstance.patch(`${API_URL}/cancel-order/${userId}/${orderId}/${productId}`, {}, {
           headers: {
             Authorization: `Bearer ${token}`
           }
        });
        
         
        if(response.status===200){
            return response.data
        }
    }catch(error){
      console.log('cancel order error:',error)  
    }
}

const fetchOrder=async ()=>{
  try{
     
      const response=await axiosInstance.get(`${API_URL}`,{
          headers:{
             Authorization:`Bearer ${token}`
          }
      })
      if(response.status===200){
        console.log( 'response',response.data?.orders);
        
        const deliveredOrders = response.data.orders.filter(order => order.orderStatus === 'delivered');
        console.log("delivered",deliveredOrders);
        return deliveredOrders;
      }
  } catch(error){
      console.log("Error occured while fetching orders",error)
  }
}


export {fetchOrderData,statusUpdate,cancelOrder,fetchOrder}