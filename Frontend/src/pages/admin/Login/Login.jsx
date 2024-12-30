import { useState } from 'react';
import './AdminLogin.css';
import {useNavigate} from 'react-router-dom'
import axiosInstance from '../../../api/axiosInstance';


export default function Login() {

   const [formData,setFormData]=useState({email:"",password:""})
   const [error,setError]=useState({})
   const [loading,setLoading]=useState(false)
   const navigate=useNavigate('')
   

   const handleChanges=async (e)=>{
    setFormData({...formData,[e.target.id]:e.target.value.trim()});
   }

   const validateForm=()=>{
    let formError={}
    if(!formData.email){
      formError.email="Email is required"
    }
    if(!formData.password){
      formError.password="Password is required"
    }else if(formData.password.length<6){
      formError.password="Password must be atleast 6 characters"
    }
    setError(formError)
    return Object.keys(formError).length===0;

   }

   const handleSubmit=async (e)=>{
    e.preventDefault();
  
    if(!validateForm()) return 
    try{
      setLoading(true)
      const response=await axiosInstance.post('/api/admin/admin-login',formData,{
        headers:{
          "Content-Type":'application/json'
        }
      })

      console.log(response)
      if(response.status===200){
        console.log(response)
        localStorage.setItem('adminToken',response.data.token)
        setFormData({email:" ",password:" "}),
        navigate('/user')
      }else{
        console.log("Admin failed to login")
      }

    }catch(error){
       console.log(error.message)
       setLoading(false)
    }finally{
      setLoading(false)
    }
    
   }


  return (
    <>
 
    <div className='form-container'>
      <h1 className='form-title'>ADMIN LOGIN</h1>
      <form className='form'onSubmit={handleSubmit}>
        <input
          type='email'
          placeholder='Email'
          id='email'
          className='form-input'
          onChange={handleChanges}
          value={formData.email}
        />
        <input
          type='password'
          placeholder='password'
          id='password'
          className='form-input'
          onChange={handleChanges}
          value={formData.password}
        />
{error.email && <p style={{ color: 'red' }}>{error.email}</p>}
{error.password && <p style={{ color: 'red' }}>{error.password}</p>}

        <button className='form-button' type='submit'>Sign In</button>
      </form>
    </div>
    </>
  );
}
