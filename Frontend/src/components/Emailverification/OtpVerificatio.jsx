import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Header/Navbar';
import axiosInstance from '../../api/axiosInstance';
import Footer from '../Footer/Footer';

function OTPVerification() {
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [message, setMessage] = useState('');
  const navigate=useNavigate()

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    console.log(1)
    try {
       
        const emailObj = JSON.parse(localStorage.getItem("user")).email
      
        console.log(2);
      const response = await axiosInstance.post('/api/user/otp-verification', {
        emailObj,
        otp: otp.join(''),
      });
      
      console.log(response.data)
      if(response.status===200){
        navigate('/reset-password')
      }
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.message);
     
    }
  };

  const resendOTP = async () => {
    try {
      setOtp(Array(6).fill(''));
      setTimer(60);
      setIsResendDisabled(true);
      const email = JSON.parse(localStorage.getItem("user")).email
      console.log(email);
      
      const response = await axiosInstance.post('/api/user/resend-otp', { email});
      console.log(response);
      
      setMessage(response.data.message);

      console.log('OTP resent');
    } catch (error) {
      setMessage(error.response?.data?.message || "");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
  <>
  <NavBar/>
     <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh'}}>
      <div className="card shadow-lg p-5 rounded" style={{ width: '500px', height:"520px", borderRadius: '12px' ,marginLeft:'508px'}}>
        <h2 className="text-center mb-4" style={{ fontWeight: '600', }}>OTP Verification</h2>
        <p className="text-center mb-4" style={{ color: '#666' }}>Enter the 6-digit code sent to your email</p>
        
        <div className="text-center mb-4">
          <span className="d-block" style={{ fontSize: '16px', fontWeight: '500' }}>
            Time remaining: <strong>{formatTime(timer)}</strong>
          </span>
        </div>

        <div className="otp-input d-flex justify-content-between mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="number"
              min="0"
              max="9"
              required
              className="form-control text-center"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              style={{
                width: '50px',
                fontSize: '24px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px',
              }}
            />
          ))}
        </div>

        <div className="d-flex justify-content-between flex-column">
          <button
            className="btn btn-primary w-100 mb-3"
            onClick={verifyOTP}
            style={{ padding: '12px', fontSize: '16px', fontWeight: '500' }}
          >
            Verify
          </button>

          <button
            className="btn btn-outline-secondary w-100"
            onClick={resendOTP}
            disabled={isResendDisabled}
            style={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: '500',
              borderRadius: '8px',
            }}
          >
            Resend Code
          </button>
        </div>

        {message && (
          <div className="alert alert-info mt-3 text-center" role="alert">
            {message}
          </div>
        )}
      </div>
    </div>
  </>
  );
}

export default OTPVerification;
