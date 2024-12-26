
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { cancelOrder, fetchOrders, returnOrder } from '../../api/user/OrderApi';
import './orderDetails.css';
import Navbar from '../Header/Navbar';
import Footer from '../Footer/Footer';
import Sidebar from "../ProfileCard/Sidebar";
import jsPDF from 'jspdf'
import axios from 'axios';
import "jspdf-autotable";
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';


const ITEMS_PER_PAGE = 5;

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [orderData, setOrderData] = useState({});
  const userId = localStorage.getItem('userId');
  const [reason,setReason]=useState('')
  const navigate=useNavigate()
  const [forceUpdate, setForceUpdate] = useState(0);
  const triggerReRender = () => setForceUpdate((prev) => prev + 1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrder = async () => {
    try {
      const response = await fetchOrders();
      if (response && Array.isArray(response)) {
        setOrders((prevOrders) => [...response]);
      }
    } catch (error) {
      toast.error("Error occurred. Please Wait");
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [userId,forceUpdate]);

  const totalEntries = orders.length;

  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
 

  const handleCancelClick = (productId, orderId) => {
    setActionType('cancel');
    setOrderData({ productId, orderId });
    setShowModal(true);
  };

  const handleReturnClick = (productId, orderId) => {
    setActionType('return');
    setOrderData({ productId, orderId });
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    const { productId, orderId } = orderData;
    try {
      let response;
      if (actionType === 'cancel') {
        response = await cancelOrder(productId, orderId, {cancelRreason:reason});
      } else if (actionType === 'return') {
        response = await returnOrder(productId, orderId,{returnReason:reason});
      }

      if (response) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.orderId === orderId) {
              return {
                ...order,
                products: order.products.filter((product) => product.productId !== productId),
              };
            }
            return order;
          })
        );
        fetchOrder();
        setShowModal(false); 
      }
    } catch (error) {
      toast.error("Action failed. Please try again.");
    }finally{
      setReason('')
    }
  };

     const handleDownloadInvoice = async (orderId) => {
      console.log(orderId);
      const order = orders.find((o) => o.id === orderId);

      console.log("order download",order);

     if(order){
      const doc = new jsPDF();
   
      
      doc.setFontSize(18);
      doc.text("TIARA", 14, 20);
      doc.setFontSize(12);
      doc.text("Address Line 1", 14, 28);
      doc.text("Address Line 2", 14, 34);
      doc.text("City,Village, ZIP Code", 14, 40);
      doc.text("Phone: 987-654-3210", 14, 46);
      doc.text("Email: info@tiara.com", 14, 52);
  

      doc.setFontSize(16);
      doc.text("Invoice", 170, 20, { align: "right" });
      doc.setFontSize(10);
      doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 170, 26, {
        align: "right",
      });
      doc.text(`Invoice No: ${order.orderNumber}`, 170, 32, { align: "right" });

      doc.setFontSize(12);
      doc.text("Bill To:", 14, 70);
      doc.text(`Client Name: ${order.name}`, 14, 76);
      doc.text(
        `Client Address: ${order?.pincode}, ${
          order?.street },${order?.village}`,
               14,
        82
      );

      doc.text(`Client Email: ${order?.email || "client@example.com"}`, 14, 88);
      
      const getRandomDate = () => {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1); // Set range start to 1 year ago
        const end = new Date(); // Current date
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      };

      doc.text("Order Summary", 14, 100);
      doc.text(
        `Placed At: ${getRandomDate().toLocaleDateString()}`,
        14,
        106
      );
      doc.text(`Payment Method: ${order.paymentMethord}`, 14, 112);
      doc.text(`Discount Applied: ${Math.round(order.discountPrice || 0.00)}`, 14, 118);

      const items = order.products || [
        { product: { productName: "Item 1" }, quantity: 1, price: 100 },
        { product: { productName: "Item 2" }, quantity: 2, price: 250 },
      ];
     console.log(items);
     
      const tableData = items.map((item, index) => [
        index + 1,
       `${item.name}${item.itemStatus === "cancelled" ? " (Cancelled)" : ""}`,
        item.quantity,
        `${item.price.toFixed(2)}`,
        `${(item.quantity * item.price).toFixed(2)}`,
      ]);
  
      const discount =Math.round(order.discountPrice || 0);
      const deliveryCharge = 100;
  
      if (order?.discountPrice) {
        tableData.push(["", "Discount", "", "", `-${discount.toFixed(2)}`]);
      }
  
      if (deliveryCharge > 0) {
        tableData.push([
          "",
          "Delivery Charge",
          "",
          "",
          `${deliveryCharge}`,
        ]);
      }
  
      tableData.push(["", "Total", "", "", `${(order.orderTotal + 100).toFixed(2)}`]);

  
      doc.autoTable({
        startY: 130,
        head: [["No", "Products", "Quantity", "Unit Price", "Total Price"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: "#0f3460",
          textColor: "#ffffff",
        },
        alternateRowStyles: {
          fillColor: "#d3d3d3", 
        },
      },
    );
  
      doc.setFontSize(10);
      const pageWidth = doc.internal.pageSize.getWidth();
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text("Thank you for your business!", pageWidth / 2, finalY, {
        align: "center",
      });
      doc.text(
        "If you have any questions, please contact us at support@tiara.com",
        pageWidth / 2,
        finalY + 6,
        { align: "center" }
      );
  
      doc.save(`Invoice-${orderId}.pdf`);
     }
    };



const handleRetryPayment = async (orderId, productId) => {
  try {
    const token = localStorage.getItem("userToken");

    const response = await axios.post(
      "/api/user/order/retry-payment",
      { razorId: orderId, productId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const razorpayOrder = response.data.razorpayOrder;
    const amountToPay = response.data.amountToPay;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amountToPay * 100, 
      currency: "INR",
      name: "Tiara",
      description: "Retry Payment",
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          await axios.post(
            "/api/user/order/change-payment-status",
            {
              razorId: razorpayOrder.id,
              productId,
              paymentStatus:"payment success",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (updateResponse.status === 200) {
        
            setOrders((prevOrders) =>
              prevOrders.map((order) => {
                if (order.orderId === orderId) {
                  return {
                    ...order,
                    products: order.products.map((product) =>
                      product.productId === productId
                        ? { ...product, itemStatus: "payment success" }
                        : product
                    ),
                  };
                }
                return order;
              })
            );
            await fetchOrder();
            triggerReRender()
            toast.success("Payment successful! The product status has been updated.");
          }
        } catch (error) {
          console.error("Error updating payment status:", error);
          // toast.error("Payment was successful, but we couldn't update the product status. Please contact support.");
        }
      },
      prefill: {
        name: response.data.userDetails?.name || "Guest",
        contact: response.data.userDetails?.phone || "0000000000",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        onClose: () => {
          navigate('/order-details');
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", async function (response) {
      console.error("Payment failed:", response);

      await axios.post(
        "/api/user/order/change-payment-status",
        {
          razorId: razorpayOrder.id,
          productId,
          paymentStatus: "payment failed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.error("Payment failed! Please try again.");
    });
  } catch (error) {
    console.error("Error retrying payment:", error);
    toast.error(error.response?.data?.message);
  }
};


  return (
    <>
      <Navbar />
      <Sidebar />

      <div className="order-details-container">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.flatMap((order) =>
            order.products.map((product, index) => (
              <div
               key={`${order.orderNumber}-${product.productId}-${index}`} className="order-content">
                <div className="order-header">
                  <img
                    src={`${product.image}`}
                    alt={product.name}
                    className="order-avatar"
                  />
                  <div className="order-info">
                    <h4>{product.name}</h4>
                    <p className="order-number">Order Number: {order.orderNumber}</p>
                  </div>
                </div>

                <div className="order-details">
                  <p><strong>Status:</strong> {product.itemStatus}</p>
                  <p><strong>Price:</strong> {Math.round(product.offerPrice ? product.offerPrice :product.price)}</p>
                  <p><strong>Order total:</strong> {order.orderTotal}</p>
                  <p><strong>Quantity:</strong> {product.quantity}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethord}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                  <p><strong>Address:</strong></p>
                  <p>
                    <strong>Country:</strong> {order.country}, <strong>street:</strong>{order.street},
                    <strong> village:</strong>{order.village}, <strong>pincode:</strong>{order.pincode}
                  </p>
                </div>

                <div className="order-btn-group">
                {product.itemStatus!=='delivered' && product.itemStatus !=="cancelled" ? 
                  <button
                  className="order-btn"
                  style={{ backgroundColor: product.itemStatus === 'cancelled' ? 'red' : '#0f3460' }}
                  onClick={() => handleCancelClick(product.id, order.id)}
                >
                  {product.itemStatus === 'cancelled' ? "Order Cancelled" : "Cancel Product"}
                </button> : ""}
                
                  {product.itemStatus!=='cancelled'? (
                    <button
                    className="order-btn"
                    onClick={() => handleReturnClick(product.id, order.id)}
                  >
                    Return
                  </button>
                  ) : ""}
                  
                 {product.itemStatus==="payment failed" && 
                 <button className='btn' onClick={()=>handleRetryPayment(order.razorId,product.id)}>
                      Retry payment
                 </button>
                 }

{![ 
    'pending', 
    'pending payment', 
    'payment failed', 
    'cancelled', 
    'returned'
  ].includes(product.itemStatus) && (
    <button
      className="order-btn"
      onClick={() => handleDownloadInvoice(order.id? order.id : order.razorId)}
    >
      Download Invoice
    </button>
  )}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="no-order">No orders found.</div>
        )}

        
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalEntries={totalEntries}
          entriesPerPage={ITEMS_PER_PAGE}
        />


      </div>

      
      
      

{showModal && (
  <div
    className="modal fade show"
    tabIndex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    style={{ display: 'block' }}
  >
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">
            {actionType === 'cancel' ? 'Confirm Cancel' : 'Confirm Return'}
          </h5>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={() => setShowModal(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to {actionType === 'cancel' ? 'cancel' : 'return'} this product?
          </p>
          <textarea
            className="form-control"
            placeholder={`Enter a reason for ${actionType === 'cancel' ? 'cancellation' : 'return'}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
          />
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            data-dismiss="modal"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmAction}
            disabled={!reason.trim()} 
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default OrderDetails;
