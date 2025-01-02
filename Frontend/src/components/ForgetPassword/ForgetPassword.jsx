import React,{useState} from 'react'
import './ForgetPassword.css'
import NavBar from '../Header/Navbar'
import Footer from '../Footer/Footer'
import { forgetPassword } from '../../api/user/forgetPasseord';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';
import {toast} from "react-toastify"


function ForgetPassword() {

  const [email,setEmail]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const navigate=useNavigate()


  const ForgetPassword=async (e)=>{
    e.preventDefault();
    setError('');
    if(!email.trim()){
      setError("Email is requied")
      return
    }
    try{
      setLoading(true)
      const response=await forgetPassword(email);
      if(response){
      const user=localStorage.setItem("user",JSON.stringify({email:email}))
        console.log(response.message)
        navigate('/verify-email')
      }
    }catch(error){
      setLoading(false)
      toast.error("Wrong email,Please add the registered email address")
      setEmail("")
       console.log("Error:",error)  
    }finally{
      setLoading(false)
      setEmail("")
    }
  }
  return (
    <>
      <NavBar />
      <div className="forget-password-container">
        <div className="forget-password-card">
          <h3 className="forget-password-title">Forgot Password</h3>
          <p className="forget-password-description">
            Enter your email address 
          </p>
          <form className="forget-password-form" onSubmit={ForgetPassword}>
            <label htmlFor="email" className="forget-password-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="forget-password-input"
              placeholder="example@example.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
            {error && <p style={{color:"red"}}>{error}</p>}
            <button type="submit" className="forget-password-button" >
              Next
            </button>
          </form>
          {loading ? <Loader/>: ''}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgetPassword;

