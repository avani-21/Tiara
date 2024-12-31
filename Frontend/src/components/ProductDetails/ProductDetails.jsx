import { Col, Container, Row } from "react-bootstrap";
import "./product-details.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Loader from "../Loader/Loader";
import axiosInstance from "../../api/axiosInstance";
import pageNotFount from '../../pages/PageNotFound/PageNotFound'
import { toast } from "react-toastify";

const ProductDetails = () => {
  const [zoom, setZoom] = useState({});
  const [zoomStyle, setZoomStyle] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const [cart, setCart] = useState([]);
  const navigate=useNavigate()


  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoom({
      transform: `scale(2) translate(-${x}%, -${y}%)`,
    });
  };

 
  const handleMouseEnter = () => {
    setZoomStyle({
      transform: "scale(1.5)",
    });
  };

  
  const handleMouseLeave = () => {
    setZoomStyle({
      transform: "scale(1)",
    });
  };

  
  useEffect(() => {
    const fetchSingleProduct = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/user/single-product/${id}`);
        if (response.status === 200) {
          setSelectedProduct(response.data.singleProduct);
      }else{
        navigate('/page-not-found');
      }
      } catch (error) {
        navigate('/page-not-found');
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleProduct();
  }, [id]);

  const imageSrc = selectedImage || selectedProduct?.images?.[0];

  const handleSmallImageClick = (image) => {
    setSelectedImage(image); 
  };

  
  const handleAddToCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("userToken");
    console.log('listed',selectedProduct.isListed);
    if (selectedProduct?.isListed === false) {
      toast.error("This product is currently Unavailable. Try Later");
      return;
    }

    if (!userId || !token) {
      toast.error("You need to be logged in to add items to the cart.");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/api/user/cart/${userId}`,
        {
          productId: selectedProduct._id,
          quantity: 1,
          price: selectedProduct.price,
          offerPrice:selectedProduct.offerPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Product added to cart successfully!");
        setCart(response.data.items);
      } else {
        toast.error("Failed to add product to cart");
      }
    } catch (error) {
      toast.error("Error adding product to cart");
      console.error("Error:", error);
    }
  };

  

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <section className="product-page">
          <Container>
            <Row className="justify-content-center">
            
              <Col md={2} className="small-images-column">
                <div className="small-images">
                  {selectedProduct?.images?.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      className="small-image"
                      src={`${image}`}
                      alt={`Product Image ${index + 1}`}
                      loading="lazy"
                      onClick={() => handleSmallImageClick(image)}
                    />
                  ))}
                </div>
              </Col>

              <Col md={5} className="main-image-column">
                <img
                  className="Img-zoom main-image"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={zoomStyle}
                  loading="lazy"
                  src={`${imageSrc}`}
                  alt="Product"
                />
              </Col>

              
              <Col md={5} className="left-section">
                <h2>{selectedProduct?.name || "Product Name"}</h2>
                <div className="rate">
                  <div className="stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <span>{selectedProduct?.rating || ""} ratings</span>
                </div>
                <div className="info">
                  <span className="price"> 
                       { selectedProduct?.price.toFixed(2) !== selectedProduct?.offerPrice.toFixed(2) ? (
    <>
   
      <h3 style={{ textDecoration: 'line-through', color: 'red' }}>
      ₹{selectedProduct?.price.toFixed(2)}
      </h3>
      <h2>₹{selectedProduct?.offerPrice.toFixed(2)}</h2>
    </>
  ) : (
    <h4>₹{selectedProduct?.price.toFixed(2)}</h4>
  )}</span>
                  <span>Category: {selectedProduct?.category?.name || "Uncategorized"}</span>
                  <span>Description: {selectedProduct?.description}</span>
                </div>
                <p
                  style={{ color: selectedProduct?.stock < 0 ? "red" : "green" }}
                >
                  Stock: {selectedProduct?.stock || "Product not in stock"}
                </p>
                {(!selectedProduct?.isListed || !selectedProduct?.category?.isListed) && (
  <p className="text-danger">
    This product is no longer available.
  </p>
)}
                <button
                  aria-label="Add"
                  type="button"
                  className="add"
                  onClick={ handleAddToCart}
                  disabled= {!selectedProduct?.isListed && !selectedProduct?.category?.isListed}
                >
                  Add to Cart
                </button>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </>
  );
};

export default ProductDetails;
