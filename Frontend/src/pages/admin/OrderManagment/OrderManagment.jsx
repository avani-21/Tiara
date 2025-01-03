import React, { useEffect, useState } from 'react';
import NavBar from '../Navbar-Admin/Header';
import Pagination from '../../../components/Pagination/Pagination';
import "./Order.css"
import { fetchOrderData, statusUpdate } from '../../../api/admin/OrderMangment';
import { useNavigate } from 'react-router-dom';

function Order() {
    const [orders, setOrder] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [currentPage,setCurrentPage]=useState(1)
    const entriesPerPage=15;
    const [totalOrders,setTotalOrders]=useState(0)
    const navigate=useNavigate()
   
    const fetchOrders = async () => {
        try {
            const { orders,totalOrders}= await fetchOrderData(currentPage,entriesPerPage);
            
            
        
                setOrder(orders);
                setTotalOrders(totalOrders);
            
        } catch (error) {
            console.log("Error while fetching data", error);
        }
    };

    console.log(orders);
    
    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const handleStatusUpdate = async (orderNumber, productId, newStatus) => {
        try {
            const response = await statusUpdate(orderNumber, productId, newStatus);
            if (response) {
                setOrder((prevOrders) =>
                    prevOrders.map((order) =>
                        order.orderNumber === orderNumber
                            ? {
                                ...order,
                                products: order.products.map((product) =>
                                    product._id === productId ? { ...product, itemStatus: newStatus } : product
                                ),
                            }
                            : order
                    )
                );
            }
        } catch (error) {
            console.log("Error", error);
        }
    };

    const getDisabledOptions = (status) => {
        const statusOrder = ["pending","payment failed","payment success", "cancelled", "confirmed", "shipped", "delivered"];
        
        const currentIndex = statusOrder.indexOf(status);
        if (status === "cancelled") {
            return [...statusOrder.slice(0, currentIndex), "cancelled"];
        }

        return currentIndex === -1 ? [] : statusOrder.slice(0, currentIndex);
    };

    const handleDetails = (order) => {
       navigate(`/single-order/${order.orderNumber}`,{state:{order}})
    };

    return (
        <>
            <NavBar />
            <div className="product-table-container">
                <h2>Order Management</h2>
                <div className="table-header">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Name</th>
                            <th>Total Amount</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                 
                    <tbody>
    {orders && orders.length > 0 ? (
        orders.map((order) => (
            <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.name}</td>
                <td>
                    ₹{order?.orderTotal ? order?.orderTotal : order.products.reduce((total, product) => total + product.price, 0)}
                </td>
                <td>{order.paymentMethord}</td>
                <td>
                    {/* {order.products.map((product) => (
                        <div key={product._id}>
                            <select
                                value={product[0].itemStatus}
                                onChange={(e) => handleStatusUpdate(order.orderNumber, product[0]._id, e.target.value)}
                            >
                                <option value="pending" disabled={getDisabledOptions(product[0].itemStatus).includes("pending")}>Pending</option>
                                <option value="cancelled" disabled={getDisabledOptions(product[0].itemStatus).includes("cancelled")}>Cancelled</option>
                                <option value="confirmed" disabled={getDisabledOptions(product[0].itemStatus).includes("confirmed")}>Confirmed</option>
                                <option value="shipped" disabled={getDisabledOptions(product[0].itemStatus).includes("shipped")}>Shipped</option>
                                <option value="delivered" disabled={getDisabledOptions(product[0].itemStatus).includes("delivered")}>Delivered</option>
                            </select>
                        </div>
                    ))} */}

      {order.products.length > 0 ? (
                        <select
                            value={order.products[0].itemStatus}
                            onChange={(e) => handleStatusUpdate(order.orderNumber, order.products[0]._id, e.target.value)}>
                            <option value="pending" disabled={getDisabledOptions(order.products[0].itemStatus).includes("pending")}>Pending</option>
                            <option value="payment failed" disabled={getDisabledOptions(order.products[0].itemStatus).includes("payment failed")}>Payment failed</option>
                            <option value="payment success" disabled={getDisabledOptions(order.products[0].itemStatus).includes("payment success")}>Payment success</option>

                            <option value="cancelled" disabled={getDisabledOptions(order.products[0].itemStatus).includes("cancelled")}>Cancelled</option>
                            <option value="confirmed" disabled={getDisabledOptions(order.products[0].itemStatus).includes("confirmed")}>Confirmed</option>
                            <option value="shipped" disabled={getDisabledOptions(order.products[0].itemStatus).includes("shipped")}>Shipped</option>
                            <option value="delivered" disabled={getDisabledOptions(order.products[0].itemStatus).includes("delivered")}>Delivered</option>
                        </select>
                    ) :("")}
                </td>
                <td>
                    <button
                        className="btn btn-outline-light"
                        onClick={() => handleDetails(order)}
                    >
                        View
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="6">No orders available</td>
        </tr>
    )}
</tbody>



                </table>
            </div>

            <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalEntries={totalOrders}
            entriesPerPage={entriesPerPage}
          />
        </>
    );
}

export default Order;
