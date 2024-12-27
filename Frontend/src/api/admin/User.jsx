import axios from "axios"

const API_URL='/api/admin/users'

const getUsers=async ()=>{
try{
    const token=localStorage.getItem('adminToken')
    const response=await axiosInstance.get(`${API_URL}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    console.log('user',response.data.users)
    if(response.status===200){
        const activeUsers=response.data.users
        return activeUsers
    }
}catch(error){
   console.log(error)
}
}

export {getUsers}