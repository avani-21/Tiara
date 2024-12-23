import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import Loader from "../../../components/Loader/Loader";
import Navbar from "../../../components/Header/Navbar";
import Footer from "../../../components/Footer/Footer";

const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refferalCode,setRefferalCode]=useState("")
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleRefferalCode=(e)=>setRefferalCode(e.target.value)

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    } else if (username.length < 4) {
      setError("Username must have atleast 4 character");
      return false;
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("Username can contain only numbers and string");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must have at least 6 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const formData = { username, email, password ,refferalCode};

      const response = await axios.post("/api/user/signup", formData);
      console.log(response);

      if (response.status === 200) {
        localStorage.setItem("userToken", response.data.token);
        console.log(4);
        localStorage.setItem("user", JSON.stringify({ email: email }));
        navigate("/otp");
      }
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        "Error in user signup. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100vw" }}>
      <Navbar />
      <div id="particles-js" className="snow"></div>
      <main>
        <div className="left-side"></div>
        <div className="right-side">
          <h1>SIGN UP</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username"></label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            <label htmlFor="email"></label>
            <input
              type="email"
              placeholder="Enter Email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
            <label htmlFor="password"></label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
               <label htmlFor="referralCode"></label>
            <input
              type="text"
              placeholder="Referral Code (optional)"
              name="referralCode"
              value={refferalCode}
              onChange={handleRefferalCode}
            />
            <button type="submit" className="login-btn">
              {loading ? <Loader /> : "Sign Up"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="links">
              <a onClick={() => navigate("/login")}>Already have an account?</a>
              <a onClick={() => navigate("/login")}>LOGIN</a>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserSignup;
