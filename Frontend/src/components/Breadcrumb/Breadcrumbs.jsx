import React from 'react';
import './BreadCrumbs.css'
import { Link, useLocation } from 'react-router-dom';

const BreadCrumb = () => {
  const location = useLocation();  
  const pathnames = location.pathname.split('/').filter(x => x);  

  return (
    <nav>
      <ul className="breadcrumb">
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          return (
            <li key={to}>
              <Link to={to}>
                {value.charAt(0).toUpperCase() + value.slice(1)} 
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BreadCrumb;
