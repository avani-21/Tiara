import React, { useEffect ,useState} from 'react'
import NavBar from '../../../components/Header/Navbar'
import { Container, Row, Col, Button } from "react-bootstrap";
import Footer from '../../../components/Footer/Footer'
import BreadCrumb from '../../../components/Breadcrumb/Breadcrumbs'
import './wishlist.css'
import { deleteFromWishlist, getWishlist } from '../../../api/user/Wishlist'
import { toast } from 'react-toastify';
import { addToCart } from '../../../api/user/Cart';
import { useNavigate } from 'react-router-dom';


function Wishlist() {
    const [wishlist,setWishlist]=useState([])
    const userId=localStorage.getItem('userId')
    const navigate=useNavigate()

    const fetchWishlist=async ()=>{
        const result=await getWishlist();
        console.log(result);
        
        
        if(result){
            setWishlist(result)
        }
      }

   useEffect(()=>{
      fetchWishlist();
   },[])

const removeFromWishlist=async (productId)=>{
  
  try{
    const result=await deleteFromWishlist(productId)
    if(result){
      fetchWishlist();
      toast.success("Product removed from wishlist successfully")

    }
  }catch(error){
    console.log(error);
  }

}

const addToCartFromWishList=async (productId,price,quantity,offerPrice)=>{
   try{
     const result=await addToCart(productId,price,quantity,offerPrice)
     console.log(result);
     
     if(result){
      await removeFromWishlist(productId);
      fetchWishlist()
      toast.success("Product added to cart")
     }
   }catch(error){
    console.error("Failed to add to cart and remove from wishlist:", error);
     toast.error("Failed to add prouct to cart")
   }
}


    return (
        <div>
          <NavBar />
          <BreadCrumb />
          <section className="wishlist-items">
  <Container>
    <Row className="justify-content-center">
      <Col md={10}>
        {wishlist.items?.length <= 0 ? (
          <h1 className="no-items product">Your Wishlist is empty</h1>
        ) : (
          wishlist?.items?.map((item) => (
            <div key={item.productId?._id} className="wishlist-list">
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
                  <Row className="wishlist-content align-items-center">
                    <Col xs={12} sm={9} className="wishlist-details">
                      <h3>{item.productId?.name}</h3>
                      <p
                        style={{
                          color: item.productId?.stock > 0 ? "green" : "red",
                        }}
                      >
                        Available Stock: {item.productId.stock}
                      </p>
                    </Col>

                    <Col xs={12} sm={9} className="wishlist-details">
                      <h3>
                        Price:{" "}
                        {item.productId?.offerPrice
                          ? item.productId?.offerPrice
                          : item.productId?.price}
                      </h3>
                    </Col>
                    <Col>
                      <Button
                        className="AddToCart"
                        onClick={() =>
                          addToCartFromWishList(
                            item.productId?._id,
                            item.productId?.price,
                            1,
                            item.productId?.offerPrice
                          )
                        }
                      >
                        Add to Cart
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        className="btn"
                        style={{ marginTop: "20%" }}
                        onClick={() => removeFromWishlist(item.productId?._id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              {/* Error message row */}
              <Row>
                {!item.productId?.isListed && !item.productId?.category?.isListed && (
                  <Col>
                    <p className="text-danger">
                      This product is no longer available.
                    </p>
                  </Col>
                )}
                {item.productId?.stock === 0 || item.productId?.stock < item.quantity ? (
                  <Col>
                    <p className="text-danger">
                      This product is out of stock.
                    </p>
                  </Col>
                ) : null}
              </Row>
            </div>
          ))
        )}
      </Col>
    </Row>
  </Container>
</section>

          <Footer />
        </div>
      );
      
}

export default Wishlist
