import axios from "axios"

const API_URL="/api/user/category"

const getCategory=async ()=>{
  try{
    const response=await axiosInstance.get(`${API_URL}`)
    if(response){
        return response.data
    }
  }catch(error){
   toString.error(error.response?.data?.message)
  }
}

export {getCategory}