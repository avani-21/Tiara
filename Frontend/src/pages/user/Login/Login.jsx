import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, provider } from '../../../firebase/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import './Login.css';
import Navbar from '../../../components/Header/Navbar'
import Footer from '../../../components/Footer/Footer'

const UserLogin = () => {
  const [formData, setFormData] = useState({email: '',password: '' });
  const [error, setError] = useState({});
  const navigate = useNavigate();




  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let formError = {};
  
  
    if (!formData.email.trim()) {
      formError.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formError.email = 'Invalid email format';
    }
  
  
    if (!formData.password.trim()) {
      formError.password = 'Password is required';
    } else if (formData.password.length < 6) {
      formError.password = 'Password must be at least 6 characters';
    }
  
    setError(formError);
    return Object.keys(formError).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axiosInstance.post('/api/user/signin', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
       
       const id=response.data.user.id
      if (response.status === 200) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('userId',id)
      
        
        navigate('/');
      } else {
        console.log('User failed to login');
      }
    } catch (error) {
      setError({ ...error, message: 'Login failed. Please try again.' });
    }
  };


  const handleClick = async () => {
  try {
    const data = await signInWithPopup(auth, provider);
    const userEmail = data.user.email;
    const googleId = data.user.uid;
    const displayName = data.user.displayName; 

    const response = await axiosInstance.post('/api/user/google-signin', {
      email: userEmail,
      googleId,
      displayName, 
    });

    if (response.status === 200) {
      localStorage.setItem('email', userEmail);
      localStorage.setItem('userToken', response.data.token);
      console.log("response-login",response);
      localStorage.setItem('userId',response.data.user.id)
      navigate('/');
    } else {
      console.log('Failed to sign in with Google');
    }
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    alert('Sign-in failed. Please try again.');
  }
};

  

  return (
    <>
        <Navbar/>
      <div id="particles-js" className="snow"></div>
      <main>
        <div className="left-side"></div>
        <div className="right-side">
          <h1>LOGIN</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              name="email"
              value={formData.email}
              onChange={handleChanges}
              required
            />
           
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              value={formData.password}
              onChange={handleChanges}
              required
            />
            {error.password && <p style={{ color: 'red' }}>{error.password}</p>}
            {error.email && <p style={{ color: 'red' }}>{error.email}</p>}
            <button type="submit" className="login-btn">
              Sign in
            </button>
          </form>

          <div className="google-login">
            <button type="button" className="btn" onClick={handleClick}>
              <img
                className="logo"
                src="https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/d1c98974-c62d-4071-8bd2-ab859fc5f4e9"
                alt="Google Logo"
              />
              <span className='note'>Sign in with Google</span>
            </button>
          </div>

          <div className="links">
            <a onClick={()=>navigate('/forget-password')}>Forgot password?</a>
            <a onClick={()=>navigate('/sign-up')}>Do not have an account?</a>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
};

export default UserLogin;
