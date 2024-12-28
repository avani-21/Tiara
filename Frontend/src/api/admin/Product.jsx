import axiosInstance from "../axiosInstance"

const API_URL='/api/admin/products/top-products'
const API_URL_PRODUCT="/api/admin/product"

const getTopProducts=async ()=>{
    const token = localStorage.getItem("adminToken")

  try{
    const response=await axiosInstance.get(`${API_URL}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })
    if(response.status===200){
        return response.data.products

    }
  }catch(error){
   console.log("top product fetchimg");
  }
}

const allProducts=async ()=>{
  const token=localStorage.getItem('adminToken')
  try{
   const response=await axiosInstance.get(`${API_URL_PRODUCT}`,{
    headers:{
      Authorization:`Bearer ${token}`
    }
   })
   if(response.status===200){
      const products=response.data.allProduct.filter(product=>product.isListed)
      return products
   }
  }catch(error){
   console.log('product feetch error');
   
  }
}

export {getTopProducts,allProducts}