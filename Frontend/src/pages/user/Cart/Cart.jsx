import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button ,Modal} from "react-bootstrap";
import NavBar from "../../../components/Header/Navbar";
import Footer from "../../../components/Footer/Footer";
import { toast } from "react-toastify";
import axios from "axios";
import { removeFromCart } from "../../../api/user/cart";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "../../../components/Breadcrumb/Breadcrumbs";
import { applyCoupon, getCoupon } from "../../../api/user/Coupon";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [couponCode,setCouponCode]=useState("");
  const [discountedPrice,setDiscountedPrice]=useState(null)
  const [discount,setDiscount]=useState(0)
  const [availableCoupons, setAvailableCoupons] = useState([]);  
  const [showCouponModal, setShowCouponModal] = useState(false);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(`/api/user/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response",response.data.cart.items)
      if (response.status === 200) {
        setCart(response.data.cart.items);
      }
    } catch (error) {
      console.log("Error fetching cart:", error)
    }
  };

  useEffect(() => {
    fetchCart();
    getCoupen();
  }, []);

  const increaseQuantity = async (productId) => {
    if (discountedPrice !== null) return;
    try {
      console.log(11);

      const token = localStorage.getItem("userToken");
      console.log(22);

      const response = await axios.patch(
        `/api/user/cart/${userId}/increase/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("inc", response);

      if (response.status === 200) {
        fetchCart();
        setCart(response.data.cart.items);
      }
    } catch (error) {
      console.log("error: ", error.message);
      toast.error(
        "failed to increase quantity.You can add maximum of 5 product"
      );
    }
  };

  const decreaseQuantity = async (productId) => {
    if (discountedPrice !== null) return;
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.patch(
        `/api/user/cart/${userId}/decrease/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        fetchCart();
        setCart(response.data.cart.items);
      }
    } catch (error) {
      console.log("error: ", error.message);
      toast.error("failed to decrease quantity");
    }
  };


  const handleRemoveFromCart =async (productId)=>{
      try{
        const response=await removeFromCart(productId);
        if(response){
          fetchCart();
        }
      }catch(error){
        console.log(error)
        toast.error("Failed to remove from cart");
      }
  }
  
  const getCoupen=async ()=>{
    try{
      const response=await getCoupon()
      
      
      if(response){
        setAvailableCoupons(response)
        console.log("coupens:",availableCoupons);
      } else {
        toast.error("No coupons available");
      }
    }catch(error){
      console.log(error)
    }
}


  const handleCouponChange=(e)=>{
    setCouponCode(e.target.value)
  }

  const applyCoupon = async () => {
    try {
      const token = localStorage.getItem("userToken");
  
      const response = await axios.post(
        `/api/user/coupon/apply-coupon/${userId}`,
        { code: couponCode }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const  discountedPrice  = response.data.discountedPrice; 
      console.log('price',discountedPrice);
      
     const discount=response.data.discount
     console.log('discount',discount);
     
     setDiscount(discount)
     console.log('discount',discount);
     
       
      setDiscountedPrice(discountedPrice);
      toast.success("Coupon applied successfully");
    } catch (error) {
      console.log(error.response?.data);
      
      toast.error(error?.response?.data?.message || "Invalid");
    }
  };
  

  

  const calculateTotalPrice = () =>
    cart.reduce(
      (total, item) =>
        total +
        (item.productId?.offerPrice ? item.productId?.offerPrice: item.productId?.price) * item.quantity,
      0
    );

  console.log("final price",calculateTotalPrice())


  const totalPrice = calculateTotalPrice();
 
  const finalPrice = discountedPrice !== null ? discountedPrice : totalPrice;

  
  const toggleCouponModal = () => setShowCouponModal(!showCouponModal);

  
  const handleCopyCoupon = (coupon) => {
    navigator.clipboard.writeText(coupon.code);
    toast.success(`Coupon Code  copied to clipboard!`);
    setShowCouponModal(false); 
  };

  const handleCheckout = () => {
    navigate("/car", { state: { finalPrice} });
  };


   

    return (
      <div>
        <NavBar />
        <BreadCrumb />
        <section className="cart-items">
          <Container>
            <Row className="justify-content-center">
              <Col md={8}>
                {cart.length === 0 ? (
                  <h1 className="no-items product">
                    No Items are added to the Cart
                  </h1>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId?._id} className="cart-list">
                      <Row className="align-items-center">
                        <Col className="image-holder" sm={4} md={3}>
                          <img
                            src={`${
                              item.productId?.images?.length > 0
                                ? item.productId?.images[0]
                                : "default-image.jpg"
                            }`}
                            alt={item.productId?.name}
                            className="img-fluid"
                          />
                        </Col>
                        <Col sm={8} md={9}>
                          <Row className="cart-content align-items-center">
                            <Col xs={12} sm={9} className="cart-details">
                              <h3>{item.productId?.name}</h3>
                              <h4>
                              ₹{item.productId?.offerPrice ? item.productId?.offerPrice : item.productId?.price } x {item.quantity}{" "}
                                <span>
                                ₹{item.productId?.offerPrice ? item.productId?.offerPrice : item.productId?.price* item.quantity}
                                </span>
                              </h4>
                              {(!item.productId?.isListed && !item.productId?.category?.isListed) && (
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
                            </Col>
                            <Col
                              xs={12}
                              sm={3}
                              className="cartControl d-flex justify-content-center align-items-center"
                            >
                              {item.productId?.stock<item.quantity ? " " :(
                           <Button
                           variant="outline-primary"
                           onClick={() => {
                               increaseQuantity(item.productId?._id);
                           
                           }}
                           disabled={!item.productId?.isListed || item.productId?.stock<item.quantity}
                           className={!item.productId?.isListed ? "disabled" : ""}
                         >
                           <i className="bi bi-plus"></i>
                         </Button>
                              )}
 

                              <Button
                                variant="outline-danger"
                                onClick={() =>
                                  decreaseQuantity(item.productId?._id)
                                }
                                disabled={!item.productId?.isListed}
                                className={
                                  !item.productId?.isListed ? "disabled" : ""
                                }
                              >
                                <i className="bi bi-dash"></i>
                              </Button>
                            </Col>
                          </Row>
                        </Col>
                        <Button
                          variant="outline-danger"
                          className=""
                          style={{ width: "fit-content",marginLeft:"85%"}}
                          onClick={() => handleRemoveFromCart(item.productId?._id)}
                        >
                          Remove
                         {/* <i className="bi bi-trash"></i> */}
                        </Button>
                      </Row>
                    </div>
                  ))
                )}
              </Col>
              <Col md={4}>
              {cart.length===0 ? ("") : (
              
              <div className="cart-total border p-3">
              <h2>Cart Summary</h2>
              <div className="d-flex justify-content-between">
                <h4>Total Price:</h4>
                <h3>₹{Math.round(calculateTotalPrice())}</h3>
              </div>

              <div>
              <div>
  <div className="form-group">
    <label htmlFor="couponCode">Coupon Code</label>
    <Row className="align-items-center">
      <Col sm={9}>
        <input
          type="text"
          id="couponCode"
          value={couponCode}
          onChange={handleCouponChange}
          className="form-control"
          placeholder="Enter coupon code"
        />
      </Col>
      <Col sm={3}>
        <Button onClick={toggleCouponModal} variant="outline-info">
          <i className="bi bi-gift"></i>
        </Button>
      </Col>
    </Row>
  </div>

  <div className="d-flex justify-content-between align-items-center mt-3">
    <button
      className="coupon-btn"
      onClick={applyCoupon}
      disabled={discountedPrice !== null}
    >
      Apply Coupon
    </button>
    {discountedPrice !== null && (
      <button
        className="remove-coupon-btn btn btn-outline-danger"
        onClick={() => {
          setCouponCode("");
          setDiscountedPrice(null);
          toast.info("Coupon removed successfully.");
        }}
      >
         <i className="bi bi-trash-fill"></i>
      </button>
    )}
  </div>
</div>

      </div>
                    <div className="d-flex justify-content-between">
                    <h4>Discount:</h4>
                    <h3>{discountedPrice !== null ? `₹${discount}` : "₹0"}</h3>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h4>Final Price:</h4>
                    <h3>{Math.round(discountedPrice ? discountedPrice : finalPrice)}</h3>
                  </div>


              <button
                className="checkOut"
                onClick={() => {
                 
                  if (cart.some((item) => !item.productId?.isListed)) {
                    toast.error("Remove unavailable items from the cart.");
                  } else if (cart.length === 0) {
                    toast.error("No product found in the cart");
                  } else if (
                    cart.some(
                      (item) =>
                        item.productId?.stock <
                        item.quantity 
                    )
                  ) {
                    toast.error("Product is currently out of stock.");
                  } 
                  
                  else {
                    handleCheckout();
                  }
                }}
              >
                Proceed to Checkout
              </button>
            </div>

              )}
               
              </Col>
            </Row>
          </Container>
          <Modal show={showCouponModal} onHide={toggleCouponModal}>
        <Modal.Header closeButton>
          <Modal.Title>Available Coupons</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  <ul>
    {availableCoupons
      .filter((coupon) => coupon.isActive) 
      .map((coupon, index) => (
        <li
          key={index}
          className="d-flex justify-content-between align-items-center m-5"
        >
          <span>
            {coupon.code} - {coupon.discount}% Off
          </span>
          <Button
            variant="outline-primary"
            onClick={() => handleCopyCoupon(coupon)}
          >
            Copy Coupon
          </Button>
        </li>
      ))}
  </ul>
</Modal.Body>

      </Modal>
        </section>
        <Footer />
      </div>
    );
    
};

export default Cart;
