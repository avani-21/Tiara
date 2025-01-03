import React from "react";
import { Outlet, Navigate } from "react-router-dom";

function PublicRoute() {
  const userToken = localStorage.getItem("userToken");

  return (
    <>
      {userToken ? <Outlet /> : <Navigate to="/" />}
    </>
  );
}

export default PublicRoute;
