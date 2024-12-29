import { Col, Container, Row } from "react-bootstrap";
import FilterSelect from "../../components/FilterSelect";
import SearchBar from "../../components/SeachBar/SearchBar";
import { Fragment, useEffect, useState } from "react";
import ShopList from "../../components/ShopList";
import Banner from "../../components/Banner/Banner";
import useWindowScrollToTop from "../../hooks/useWindowScrollToTop";
import NavBar from "../../components/Header/Navbar";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../api/axiosInstance";
import BreadCrumb from "../../components/Breadcrumb/Breadcrumbs";
import Pagination from "../../components/Pagination/Pagination";
import CategoryFilter from "../../components/categoryFilter/CategoryFilter";

const Shop = () => {
  useWindowScrollToTop();

  const [product, setProduct] = useState([]); 
  const [filterList, setFilterList] = useState([]); 
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [sortQuery, setSortQuery] = useState("");
  const entriesPerPage = 10;

  

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get("/api/user/product",{
        params:{
          category:selectedCategories.length ? selectedCategories.join(',') : 'All',
          sort:sortQuery,
          searchQuery
        }
      });
      const productItem = response.data.allProductWithOffers;
      if (response.status === 200) {
        setProduct(productItem);
        setFilterList(productItem); 
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  };
  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    let filtered = [...product];

  
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) => selectedCategories.includes(item.category));
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilterList(filtered);
    fetchProduct();
  }, [selectedCategories, searchQuery,sortQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filterList.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentProducts = filterList.slice(startIndex, startIndex + entriesPerPage);

 
  const handleCategoryChange = (category, isChecked) => {
    if (isChecked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((cat) => cat !== category));
    }
  };

  return (
    <div style={{ width: "100vw", overflowX: "hidden" }}>
      <NavBar />
      <BreadCrumb />
      <Banner title="product" />
      <section className="filter-bar" style={{ marginLeft: "120px" }}>
        <Container className="filter-bar-container">
          <Row className="justify-content-center mb-4">
            <Col md={4}>
              <FilterSelect onSortChange={setSortQuery} />
            </Col>
            <Col md={8}>
              <SearchBar setSearchQuery={setSearchQuery} />
            </Col>
          </Row>
        </Container>
        <Container>
          <Row>
           
            <Col md={3} style={{ borderRight: "1px solid #ddd", paddingRight: "15px" }}>
              <CategoryFilter onCategoryChange={handleCategoryChange} />
            </Col>
       
            <Col md={9}>
              <ShopList productItems={currentProducts} />
            </Col>
          </Row>
        </Container>
        <Container className="mt-4">
          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalEntries={filterList.length}
            entriesPerPage={entriesPerPage}
          />
        </Container>
      </section>
      <Footer />
    </div>
  );
};

export default Shop;
