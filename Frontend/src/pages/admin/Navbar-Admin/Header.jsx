
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css'; 

const Header = () => {
  const navigate=useNavigate()

  const handleLogOut=()=>{
   localStorage.removeItem("adminToken")
   navigate("/admin-login")
  }

  return (
    <nav className="nav">
        <p>TIARA</p>
      <ul className="nav-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/user">Users</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/categories">Category</Link></li>
        <li><Link to="/order">Orders</Link></li>
        <li><Link to="/offers">Offer</Link></li>
        <li><Link to="/coupen">Coupon</Link></li>
        <li><Link to="/sales-report">Sales Report</Link></li>
        <li onClick={handleLogOut} className='logOut'>Logout</li>
      </ul>
    </nav>
  );
};

export default Header;
