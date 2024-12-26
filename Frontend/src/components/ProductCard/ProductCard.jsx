import { Col } from "react-bootstrap";
import "./product-card.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { products } from "../../utils/products";
import { useState } from "react";
import axios from 'axios'
import { addToWishlist } from "../../api/user/Wishlist";


const ProductCard = ({ productItem }) => {
  const router = useNavigate();
  const [cart,setCart]=useState()
  const [wishList,setWishList]=useState('')
  const navigate=useNavigate()


  
  const handelClick = () => {
    router(`/shop/${productItem._id}`);
  };
  const title = 'Big Discount';
 const userId=localStorage.getItem('userId')


  const handleCart=async ()=>{
    
  
    try{
      console.log(1);
      
      const token=localStorage.getItem('userToken')
      if(!token){
        navigate('/login');
       
        return
      }
      console.log('token',token);
      const response=await axios.post(`/api/user/cart/${userId}`,{
        productId: productItem._id, 
        quantity: 1,
        price:productItem.price,
        offerPrice:productItem.offerPrice,
      },
    {
      headers:{
        Authorization:`Bearer ${token}`
      }

    })
      console.log(response);
      
      if(response.status===200){
        toast.success("Product added to cart successfully")
        setCart(response.data.items)
      }else{
        toast.error(response.error.message)
      }
      
    }catch(error){
      toast.error("Failed to add cart")
     console.log("Error adding product to cart",error)
     console.log('Error response:', error.response);
    }
  }

  const handleAddToWishlist=async (productId,quantity,price)=>{
   try{
    const response=await addToWishlist(productId,quantity,price)
    if(response){
     setWishList(response)
    }
   }catch(error){
    toast.error("Failed to add to wishlist")
   }
  }

  return (
    <Col md={3} sm={5} xs={10} className="product mtop">
      {/* {title === "Big Discount" ? (
        <span className="discount">Off</span>
      ) : null} */}
      <img
        loading="lazy"
        onClick={() => handelClick()}
        src={productItem.images && productItem.images[0] ? `http://3.7.169.158/${productItem.images[0]}` : 'placeholder-image-url.jpg'} // Fallback to a placeholder image

        alt={productItem.name}
      />
    <div className="product-like" onClick={() => 
  !userId ? toast.error("Please login for wishlisting a product") : 
  handleAddToWishlist(productItem._id, productItem.quantity, productItem.price)
}>

        <i className="bi bi-heart"></i>
      </div>
      <div className="product-details">
        <h3 onClick={() => handelClick()}>{productItem.name}</h3>
        <div className="rate">
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
        </div>
        <div className="price">
        {productItem.offerPrice > 0 ? (
    <>
    { productItem.offerPrice !== productItem.price &&
          <h3 style={{ textDecoration: 'line-through', color: 'red' }}>
          ₹{productItem.price.toFixed(2)}
        </h3>
    }
   
      <h4>₹{productItem.offerPrice.toFixed(2)}</h4>
    </>
  ) : (
    <h4>₹{productItem.price.toFixed(2)}</h4>
  )}
          <button
            aria-label="Add"
            type="submit"
            className="add"
            onClick={handleCart}
          >
            <i className="bi bi-plus-circle"></i>
          </button>
        </div>
      </div>
    </Col>
  );
};

export default ProductCard;
