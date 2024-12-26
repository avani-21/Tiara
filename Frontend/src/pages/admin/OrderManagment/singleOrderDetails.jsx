import React, { useState,useEffect } from 'react';
import NavBar from '../../admin/Navbar-Admin/Header';
import { useLocation } from 'react-router-dom';
import './singleOrder.css'

function SingleOrderDetails() {
    const [orders,setOrders]=useState([])

    const location=useLocation()
    const order=location.state?.order

    useEffect(() => {
        if (order) {
          setOrders([order]);
        }
      }, [order]); 



  return (
    <>
      <NavBar />
      <section className="container my-5">
      <div className="table-responsive" style={{ width: '80%', marginLeft: '25%', marginBottom: '6%' }}>
        <table className="table table-light table-striped rounded">
          <caption style={{ captionSide: 'top' }}>ORDER DETAILS</caption>
          <thead className="table-dark">
            <tr>
              <th>ITEM</th>
              <th>PRICE</th>
              <th>QUANTITY</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.flatMap((order) =>
                order.products.map((product, index) => (
                  <tr key={`${order.orderNumber}-${product.productId}-${index}`}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          className="img-fluid"
                          style={{ width: '90px' }}
                          src={`http://3.7.169.158/${product.image}`}
                          alt={product.name}
                        />
                        <div className="ms-3">
                          <p className="fw-bold mb-1">{product.name}</p>
                          <p className="text-muted mb-0">Status: {product.itemStatus || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">₹{Math.round(product.offerPrice ? product.offerPrice : product.price)}</td>
                    <td className="text-center">{product.quantity}</td>
                    <td className="text-center">₹{Math.round((product.offerPrice ? product.offerPrice : product.price)* product.quantity)}</td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary and Address Info */}
      {orders.length > 0 && (
  <div className="single-order-page">
    {/* Order Summary */}
    <div className="order-summary">
      <div className="order-card">
        <h5 className="order-title">ORDER SUMMARY</h5>
        {orders.flatMap((order) => (
          <div key={order.orderNumber}>
            <div className="order-summary-item">
              <p>Shipping</p>
              <p>100</p>
            </div>
            <div className="order-summary-item">
              <p>Total</p>
              <p>₹{order.orderTotal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Order Information */}
    <div className="order-info">
      <div className="order-card">
        <h5 className="order-title">ORDER INFORMATION</h5>
        {orders.flatMap((order) => (
          <div key={order.orderNumber}>
            <p>Order #{order.orderNumber}</p>
            <div className="order-status">
              {/* <p>Status: <span className="status-success">
              {order.product && Array.isArray(order.product) && order.product.length > 0 
      ? order.product.map(item => item.itemStatus).join(', ') 
      : 'No status available'}
                </span></p> */}
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="order-address">
              <h6>ADDRESS INFORMATION</h6>
              <p>Country: {order.country}</p>
              <p>Street: {order.street}</p>
              <p>Village: {order.village}</p>
              <p>Pincode: {order.pincode}</p>
            </div>
            <div className="order-payment">
              <h6>PAYMENT INFORMATION</h6>
              <p>Payment method: {order.paymentMethord}</p>
              <p>Phone: {order.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    </section>
    </>
  );
}

export default SingleOrderDetails;
