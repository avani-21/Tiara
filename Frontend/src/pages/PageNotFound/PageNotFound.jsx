import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './PageNotFound.css'; // Import your custom CSS for styles
import Navbar from '../../components/Header/Navbar'
const NotFound = () => {
  return (
    <>  
    <Navbar/>
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <div className="not-found-card p-5 text-center">
      <h2 className="display-3 text-danger">404</h2>
      <p className="lead text-dark">Page Not Found</p>
      <p className="text-dark">The page you are looking for does not exist.</p>
      <p className="text-dark">Please check the URL or go back to the homepage.</p>
      <a href="/" className="btn btn-primary">Go to Homepage</a>
    </div>
  </div></>
  
  );
};

export default NotFound;
