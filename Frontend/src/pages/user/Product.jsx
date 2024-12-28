import { Fragment, useEffect, useState } from "react";
import Banner from "../../components/Banner/Banner";
import { Container } from "react-bootstrap";
import ShopList from "../../components/ShopList";
import { useParams } from "react-router-dom";
import ProductDetails from "../../components/ProductDetails/ProductDetails";
import ProductReviews from "../../components/ProductReviews/ProductReviews";
import useWindowScrollToTop from "../../hooks/useWindowScrollToTop";
import NavBar from "../../components/Header/Navbar";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../api/axiosInstance";

const Product = () => {
  const { id } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/single-product/${id}`);
        console.log("zxcvgh", response.data.reletedProducts);
        const reletedProducts = response.data.reletedProducts;
        const selectedProduct = response.data.singleProduct;
        console.log("selectd", selectedProduct);

        if (response.status === 200) {
          setSelectedProduct(selectedProduct);
          setRelatedProducts(reletedProducts);
          console.log("hu", response.data.relatedProducts);
        }
      } catch (error) {
        console.log("Error fetching product data", error);
      }
    };
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  useWindowScrollToTop();

  return (
    <div style={{ width: "100vw", overflowX: "hidden" }}>
      <NavBar />
      <Banner title={selectedProduct?.productName} />
      <ProductDetails selectedProduct={selectedProduct} />
      <ProductReviews selectedProduct={selectedProduct} />
      <section className="related-products">
        <Container style={{ marginLeft: "90px" }}>
          <h3>You might also like</h3>
          <ShopList productItems={relatedProducts} />
        </Container>
      </section>
      <Footer />
    </div>
  );
};

export default Product;
