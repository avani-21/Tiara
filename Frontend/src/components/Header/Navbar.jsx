import { useState, useEffect } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Profile icon
import "./Navbar.css";

const NavBar = () => {
  const [expand, setExpand] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(id);
    }
  }, []);

  function scrollHandler() {
    if (window.scrollY >= 100) {
      setIsFixed(true);
    } else if (window.scrollY <= 50) {
      setIsFixed(false);
    }
  }
  window.addEventListener("scroll", scrollHandler);

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/pro/${userId}`); // Redirect to profile page
    } else {
      navigate("/login"); // Redirect to login page
    }
  };

  return (
    <Navbar
      fixed="top"
      expand="md"
      className={isFixed ? "navbar fixed" : "navbar"}
    >
      <Container className="navbar-container">
        <Navbar.Brand to="/">
          <ion-icon name="bag"></ion-icon>
          <h1 className="logo">TIARA</h1>
        </Navbar.Brand>

        <div className="d-flex">
          <div className="media-cart">
            <Link aria-label="Go to Cart Page" to="/cart" className="cart">
              <i className="bi bi-cart"></i>
            </Link>
          </div>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => {
              setExpand(expand ? false : "expanded");
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </Navbar.Toggle>
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-end flex-grow-1 pe-3">
            <Nav.Item>
              <Link
                aria-label="Go to Home Page"
                className="navbar-link"
                to="/"
                onClick={() => setExpand(false)}
              >
                <span className="nav-link-label">Home</span>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                aria-label="Go to Shop Page"
                className="navbar-link"
                to="/shop"
                onClick={() => setExpand(false)}
              >
                <span className="nav-link-label">Shop</span>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                aria-label="Go to Cart Page"
                className="navbar-link"
                to="/cart"
                onClick={() => setExpand(false)}
              >
                <span className="nav-link-label">Cart</span>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <IconButton
                aria-label="Profile"
                onClick={handleProfileClick}
                color="inherit"
              >
                <AccountCircleIcon style={{ height: "22px" }} />
              </IconButton>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
