import axios from "axios";

const API_URL='/api/admin/categories';

const getCategories=async ()=>{
    const token=localStorage.getItem("adminToken")
    try{
     const response=await axiosInstance.get(`${API_URL}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
     })

     if(response.status===200){
        return response.data.categories
     }
    }catch(error){
     console.log('Errror fetching category',error);
    }
}

const getTopCategories=async ()=>{
    const token=localStorage.getItem("adminToken")
    try{
      const response = await axiosInstance.get(`${API_URL}/top-catogories`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
      })
      if(response.status === 200){
        return response.data.categories
      }
    }catch(error){
    console.log(error);
    }
}

export {getCategories,getTopCategories}
