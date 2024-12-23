import React, { useState } from 'react';
import './ResetPassword.css';
import NavBar from '../Header/Navbar';
import Footer from '../Footer/Footer';
import { resetPassword } from '../../api/user/forgetPasseord';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';
import {toast} from 'react-toastify'

function ResetPassword() {
  const [formData,setFormData]=useState({
    password:"",
    confirmPassword:""
  })
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const navigate=useNavigate()

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  const email=localStorage.getItem('user')

  const handleResetPassword=async (e)=>{
    e.preventDefault();
    setError('');
    const {password,confirmPassword}=formData

    if(!password.trim() || !confirmPassword.trim()){
      setError('All fields are required')
      return ;
    } 

    if(password!==confirmPassword){
      setError("Password do not match");
      return
    }
    try{
      setLoading(true)
       const response=await resetPassword(email,password,confirmPassword)
       console.log('response',response);
       
       if(response){
        setLoading(false);
        toast.success("Password reset successfully.Please login")
        navigate('/login')
       }
    }catch(error){
      console.error(error);
      setLoading(false)
      setError(err.response?.data?.message || "An error occurred");
    }finally{
      setLoading(false)
    }
  }
  return (
    <>
      <NavBar />
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h3 className="reset-password-title">Reset Password</h3>
          <p className="reset-password-description">
            Enter your new password and confirm it.
          </p>
          <form className="reset-password-form" onSubmit={handleResetPassword}>
            <label htmlFor="newPassword" className="reset-password-label">
              New Password
            </label>
            <input
              type="password"
              id="password"
              className="reset-password-input"
              placeholder="Enter new password"
              onChange={handleInputChange}
            />
            <label htmlFor="confirmPassword" className="reset-password-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="reset-password-input"
              placeholder="Confirm new password"
              onChange={handleInputChange}
            />
              {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" className="reset-password-button">
              Reset Password
            </button>
          </form>
          {loading && <Loader/> }
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ResetPassword;
