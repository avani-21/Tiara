import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

function PrivateRoute() {
  const userToken=localStorage.getItem('userToken')

  return (
    <>
      {userToken ? <Outlet /> : <Navigate to="/login" />}
    </>
  );
}

export default PrivateRoute;
