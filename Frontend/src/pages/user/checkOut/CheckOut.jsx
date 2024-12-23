import React, { useState, useEffect } from "react";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import {clearCart }from '../../../api/user/Cart'
import { Container, Row, Col } from "react-bootstrap";
import NavBar from "../../../components/Header/Navbar";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import "./checkout.css";
import { toast } from "react-toastify";
import Footer from "../../../components/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import BreadCrumb from "../../../components/Breadcrumb/Breadcrumbs";
import { razorpayOrder } from "../../../api/user/OrderApi";
import { getWallet, walletTransaction } from "../../../api/user/Wallet";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "30%",
  maxHeight: "70%",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

function Checkout() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [address, setAddress] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const navigate=useNavigate()
  const location=useLocation();
  const finalPrice = location.state?.finalPrice;
  console.log("finalftf",finalPrice);
  
  const [orderItems,setOrderItems]=useState([])
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    street: "",
    village: "",
    country: "",
    pincode: "",
    defaultAddress: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [walletBalance, setWalletBalance] = useState(0);
  const [discount,setDiscount]=useState('')
  const [minPurchase,setMinPurchase]=useState(0);
  const userId = localStorage.getItem("userId");

  const fetchAddress = async () => {
    try {
      const token = localStorage.getItem("userToken");
      console.log(token);
      const response = await axios.get(`/api/user/address/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response);

      if (response.status === 200) {
        setAddress(response.data.address);
      }
    } catch (error) {
      console.log("Error fetching address:", error);
    }
  };
  console.log("asdfghjk", address);

  const fetchCart = async () => {
    try {
      console.log(1);

      const token = localStorage.getItem("userToken");
      console.log(2);

      const response = await axios.get(`/api/user/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Cart Data:", response.data.cart.coupon.minPurchase);  

      if (response.status === 200) {
        setCart(response.data.cart.items);
        setDiscount(response.data.cart.coupon?.discount)
        setMinPurchase(response.data.cart.coupon.minPurchase)
        console.log('cart',cart);
        console.log("min purchase",response.data.cart.coupon.minPurchase)
        setOrderItems(response.data.cart.items)
      }
    } catch (error) {
      console.log("Error", error);
      toast("Failed to get cart data");
    }
  };

  useEffect(() => {
    fetchAddress();
    fetchCart();
    fetchWallet()
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.fullname.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.village.trim() ||
      !formData.country.trim() ||
      !formData.pincode.trim()
    ) {
      toast.error("All fields are required");
      return;
    }
    if (formData.pincode.length < 6) {
      toast.error("PIN code should have 6 characters");
      return;
    }
    if (formData.phone.length < 10) {
      toast.error("Phone number should have 10 characters");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

   
      if (formData._id) {
        const response = await axios.put(
          `/api/user/address/${formData._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          toast.success("Address updated successfully");
          setAddress((prevAddresses) =>
            prevAddresses.map((addressItem) =>
              addressItem._id === formData._id
                ? { ...addressItem, ...response.data.updatedAddress }
                : addressItem
            )
          );
        }
      } else {
        const response = await axios.post(
          `/api/user/address/${userId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          setAddress(response.data.newAddress);
          toast.success("New address added successfully");
        }
      }

      setOpenAddModal(false);
      fetchAddress();
    } catch (error) {
      toast.error("Failed to submit address");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.delete(`/api/user/address/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          toast.success("Address deleted successfully");
          setAddress((prevState) =>
            prevState.filter((item) => item._id !== addressId)
          );
        }
      } catch (error) {
        toast.error("Failed to delete address");
      }
    }
  };

  const handleEdit = (addressId) => {
    const selectedAddress = address.find(
      (addressItem) => addressItem._id === addressId
    );
    if (selectedAddress) {
      setFormData(selectedAddress);
      setOpenAddModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotalPrice = () =>
    cart.reduce(
      (total, item) => total + item.productId.price * item.quantity,
      0
    );

    const discountValue=calculateTotalPrice()-finalPrice;
    console.log('discount',discountValue);
    

    const fetchWallet = async () => {
      try {
        const data = await getWallet();
        console.log("wallet",data.wallet.balance);
        
        setWalletBalance(data.wallet.balance);
      } catch (error) {
       console.log(error);
      }
    };


  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, defaultAddress: e.target.checked }));
  };
  const handleSelectAddress = (addressItem) => {
    setSelectedAddress(addressItem);
    setOpenViewModal(false);
  };
  console.log('selected',selectedAddress);
  

  const handleRazorpayPayment = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const amount = Number(finalPrice)+100;  
      console.log( 'final price',Math.round(Number(finalPrice)+100));
      console.log(typeof(amount));
      

      const response = await axios.post("/api/user/order/createTransaction", {
        amount: amount,
        currency: "INR", 
        userId: selectedAddress?.userId, 
        orderItems: orderItems, 

        paymentMethord: "razorpay",
        shippingAddress: selectedAddress,
        orderSubtotal: amount,
        orderTotal: finalPrice,
        discount: discount,
        discountValue: discountValue,
        minPurchase:minPurchase,
      
      },{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
  
      const order = response.data.order; 
      console.log("Odfjrder",order);
      
     
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order?.amount,
        currency: order?.currency,
        name: "Tiara",
        description: "Test transaction",
        order_id: order?.razorId, 
        handler: async function (response) {
          console.log("Payment success", response);
  
        
          try {
            // await handlePlaceOrder({
            //   paymentMethod: "razorpay",
            //   paymentDetails: response,
            // });
  

            const paymentUpdateResponse = await axios.post("/api/user/order/change-payment-status", {
              razorId: order.id,
              paymentStatus: "payment success", 
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
  
            console.log("Payment status updated:", paymentUpdateResponse.data);
            toast.success("Payment successful! Your order is being processed.");
  
           
            navigate("/order-details");
          } catch (error) {
            console.error("Error handling payment success:", error);
            toast.error("Payment was successful, but we couldn't update the order status. Please try again.");
          }
        },
        prefill: {
          name: selectedAddress?.fullname,
          contact: selectedAddress?.phone,
        },
        theme: {
          color: "#3399cc",
        },
        modal:{
          ondismiss :()=>{
            navigate('/order-details')
          }
        }
      };
  
      const paymentObject = new window.Razorpay(options);
      await clearCart();
      paymentObject.on("payment.failed", async function (response) {
       
  
        try {
          
          const token = localStorage.getItem("userToken");
  
          console.log("User Token:", token);

          const failResponse = await axios.post("/api/user/order/change-payment-status", {
            razorId:order.id,
            order,
            paymentStatus: "payment failed",  
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          console.log("failresponse",failResponse);
          toast.error("Payment failed! Please try again.");
          navigate("/order-details");
        } catch (error) {
          console.error("Error handling payment failure:", error);
          toast.error("Failed to handle payment failure. Please try again.");
        }
      });
  
      paymentObject.open();
  
    } catch (error) {
      console.error("Error initiating Razorpay payment:", error);
      toast.error("Failed to initiate Razorpay payment. Please try again.");
    }
  };
  
  const handlePlaceOrder = async (paymentDetails = {}) => {
    try {
      const token = localStorage.getItem("userToken");

    
      const response = await axios.post(
        "/api/user/place-order",
        {
          userId,
          orderItems,
          paymentMethord: paymentDetails.paymentMethord || selectedPaymentMethod,
          paymentDetails,
          discountValue,
          shippingAddress: selectedAddress,
          totalAmount: finalPrice + 100,
          minPurchase:minPurchase,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Order placed successfully");
        await clearCart();
        navigate("/success");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("There was an error placing the order. Please try again.");
    }
  };

console.log('amount',finalPrice);

  const handleWalletPayment=async (finalPrice)=>{
    console.log("Final price",finalPrice);
    
    try{
     const response=await walletTransaction(finalPrice);
     console.log(response);
     
     if(response){
      await handlePlaceOrder({paymentMethord: "wallet"})
      toast.success("Wallet payment transaction successfully")
     }
    }catch(error){
      console.log(error);
      toast.error(error?.response?.data?.message)
      
    }
  }
  

  const handleCOD = async () => {
    const totalAmount = calculateTotalPrice();
    if (totalAmount > 250) {
      toast.error("Cash on Delivery is not available for orders above  $250.");
      return;
    }

    await handlePlaceOrder({ paymentMethord: "COD" });
  };


  return (
    <>
      <NavBar />
      <BreadCrumb/>
      <div className="row">
  <div className="checkout-card col-md-8">
    <div className="details">
      <h2>CHECKOUT</h2>
    </div>
    <p
      id="info"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginRight: "20px",
      }}
    >
      Shipping Address
      <span
        className="icons"
        style={{ display: "flex", marginLeft: "233px", gap: "10px" }}
      >
        <i
          className="bi bi-person-plus-fill"
          title="Add New Address"
          style={{ fontSize: "1.5rem", cursor: "pointer" }}
          onClick={() => setOpenAddModal(true)}
        ></i>
        <i
          className="bi bi-house-door"
          title="View Existing Address"
          style={{ fontSize: "1.5rem", cursor: "pointer" }}
          onClick={() => setOpenViewModal(true)}
        ></i>
      </span>
    </p>

    <div className="cards">
      <div className="containers">
        <div className="left-line"></div>
        <div className="corner"></div>
      </div>

      <div className="text-area">
        <p className="header">Address</p>
        {selectedAddress ? (
          <div className="address">
            <p>
              <strong>Name:</strong> {selectedAddress.fullname}
            </p>
            <p>
              <strong>Phone:</strong> {selectedAddress.phone}
            </p>
            <p>
              <strong>Address:</strong> {selectedAddress.street},{" "}
              {selectedAddress.village}, {selectedAddress.country},{" "}
              {selectedAddress.pincode}
            </p>
          </div>
        ) : (
          <p className="text">No address selected.</p>
        )}
      </div>
    </div>
    <hr />
   <div style={{overflow:"auto"}}>
   <p id="info">Your Cart Products</p>
    {cart.length === 0 ? (
      <h1 className="no-items product">No Items are added to the Cart</h1>
    ) : (
      cart.map((item) => (
        <div key={item.productId._id} className="cart-list">
          <Row className="align-items-center">
            <Col className="image-holder" sm={4} md={3}>
              <img
                src={`http://localhost:3009/${
                  item.productId.images && item.productId.images.length > 0
                    ? item.productId.images[0]
                    : "default-image.jpg"
                }`}
                alt={item.productId.name}
                className="img-fluid"
              />
            </Col>
            <Col sm={8} md={6}>
              <Row className="cart-content align-items-center">
                <Col xs={12} sm={9} className="cart-details">
                  <h5>{item.productId.name}</h5>
                  <h6>Quantity: {item.quantity}</h6>
                </Col>
                {!item.productId?.isListed && !item.productId?.category?.isListed && (
                                <p className="text-danger">
                                  This product is no longer available.
                                </p>
                              )}
                              {
                                item.productId?.stock ===0 || item.productId?.stock<item.quantity && (
                                  <p className="text-danger">
                                  This product is out of stock.
                                </p>
                                )
                              
                              }
                <Col
                  xs={12}
                  sm={3}
                  className="cartControl d-flex justify-content-center align-items-center"
                ></Col>
              </Row>
            </Col>
          </Row>
        </div>
      ))
    )}
   </div>
  </div>
  <div className="col-md-4 mt-5 ms-5">
  <div>
    <FormControl>
      <FormLabel id="demo-radio-buttons-group-label" style={{marginBottom:"20px"}}>PAYMENT METHORD</FormLabel>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        style={{marginBottom:"20px"}}
      >
        <FormControlLabel value="COD" control={<Radio />} label="Cash on delivary" />
        <FormControlLabel value="razorpay" control={<Radio />} label="Razo pay" />
        <FormControlLabel value="wallet" control={<Radio />} label="Wallet" />
      </RadioGroup>
    </FormControl>
  </div>

<div className="wallet-card">
<h2>Wallet</h2>
<h4>Balance: ₹{Math.round(walletBalance|| 0)}</h4>
</div>

  <div
    className="cart-summery border p-3"
    style={{ backgroundColor: "white" }}
  >
    <h3>CART SUMMARY</h3>
    <div className="d-flex justify-content-between mt-2 mb-5">
      <h6>Order total</h6>
      <h4>₹{Math.round(finalPrice)}</h4>
    </div>
    <div className="d-flex justify-content-between mt-2 mb-5">
      <h6>Shipping:</h6>
      <h4>₹ 100</h4>
    </div>
     <div className="d-flex justify-content-between mt-2 mb-5">
      <h6>Grand Total:</h6>
      <h4>₹{Math.round(Number(finalPrice)+100)}</h4>
    </div>
    <button className="place-order"   onClick={() => {
            if( cart.some(
              (item) =>
                item.productId?.stock <
                item.quantity 
            )){
              toast.error("Product is currently out of stock.")
            }
            else if (selectedPaymentMethod === "razorpay") {
              handleRazorpayPayment();
            } else if (selectedPaymentMethod === "COD") {
              handleCOD();
            } else if(selectedPaymentMethod==="wallet"){
             handleWalletPayment(finalPrice)
            }
          }} >PLACE ORDER</button>
  </div>
</div>

</div>

      {/* Add Address Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <TextField
            label="Full Name"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Village"
            name="village"
            value={formData.village}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.defaultAddress}
                onChange={handleCheckboxChange}
              />
            }
            label="Make this the default address"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Address"}
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        aria-labelledby="existing-address-title"
        aria-describedby="existing-address-description"
      >
        <Box sx={modalStyle}>
          <Typography id="existing-address-title" variant="h6" component="h2">
            Existing Addresses
          </Typography>
          <div style={{ marginTop: "1rem" }}>
            {address && address.length === 0 ? (
              <Typography>No addresses available.</Typography>
            ) : (
              address?.map((addressItem) => (
                <div
                  key={addressItem._id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      display: "flex",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <i
                      className="bi bi-pencil-square"
                      title="Edit"
                      style={{ fontSize: "1.2rem", color: "#007bff" }}
                      onClick={() => handleEdit(addressItem._id)}
                    ></i>
                    <i
                      className="bi bi-trash3"
                      title="Delete"
                      style={{ fontSize: "1.2rem", color: "red" }}
                      onClick={() => handleDelete(addressItem._id)}
                    ></i>
                  </div>
                  <Typography variant="subtitle1">
                    <strong>Name:</strong> {addressItem.fullname}
                  </Typography>
                  <Typography>
                    <strong>Phone:</strong> {addressItem.phone}
                  </Typography>
                  <Typography>
                    <strong>Address:</strong> {addressItem.street},{" "}
                    {addressItem.village}, {addressItem.country},{" "}
                    {addressItem.pincode}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSelectAddress(addressItem)}
                    style={{ marginTop: "1rem" }}
                  >
                    Select
                  </Button>
                </div>
              ))
            )}
          </div>
        </Box>
      </Modal>

      <Footer />
    </>
  );
}

export default Checkout;
