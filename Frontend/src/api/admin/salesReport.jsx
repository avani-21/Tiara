import axios from "axios";
import { toast } from "react-toastify";

const API_URL="/api/admin"

const salesReport=async (date)=>{
    const token=localStorage.getItem("adminToken");
    try{
     const response=await axiosInstance.post(`${API_URL}/sales-report`,date,{
        headers:{
            Authorization:`Bearer ${token}`
        }
     })
     if(response.status===200){
        return response.data
     }
    }catch(error){
        toast.error(error?.response?.data?.message)
     console.log(error)
    }
}

export {salesReport}