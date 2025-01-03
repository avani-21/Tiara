import Wrapper from "../../../components/wrapper/Wrapper";
import Section from "../../../components/Section";
import { products, discoutProducts } from "../../../utils/products";
import SliderHome from "../../../components/Slider";
import useWindowScrollToTop from "../../../hooks/useWindowScrollToTop";
import Header from "../../../components/Header/Navbar";
import Footer from "../../../components/Footer/Footer";
import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import BreadCrumb from "../../../components/Breadcrumb/Breadcrumbs";
import { use } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [item, setItem] = useState([]);
const navigate=useNavigate()
 

  useWindowScrollToTop();
  useEffect(() => {
    try {
      const fetchProducts = async () => {
        const response = await axiosInstance.get("/api/user/product");
        const item = response.data.allProductWithOffers;

        if (response.status === 200) {
          setItem(item);
        }
      };

      fetchProducts();
    } catch (error) {
      console.log("Error:", error.message);
    }
  }, []);

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
    navigate('/')
    }
  }, [navigate]);


  return (
    <div style={{ width: "100vw", overflowX: "hidden" }}>
      <Header />
      <BreadCrumb />
      <SliderHome />
      <Wrapper />
      <Section
        title="BIG DISCOUNT"
        bgColor="#f6f9fc"
        container="100vw"
        productItems={item}
      />
      <Section
        title="NEW ARRIVALS"
        bgColor="white"
        container="100vw"
        productItems={item}
      />
      <Section
        title="BEST SALLERS"
        bgColor="#f6f9fc"
        container="100vw"
        productItems={item}
      />
      <Footer />
    </div>
  );
};

export default Home;
