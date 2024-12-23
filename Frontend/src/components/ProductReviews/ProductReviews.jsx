import { useState } from "react";
import { Container } from "react-bootstrap";
import "./product-review.css";

const ProductReviews = ({ selectedProduct }) => {
  console.log('desc', selectedProduct);

  const [listSelected, setListSelected] = useState("des");

  
  const dummyReviews = [
    { rating: 5, reviews: "Great product! Really loved it." },
    { rating: 4, reviews: "Good quality, but could be improved." },
    { rating: 3, reviews: "It's okay, not what I expected." },
  ];

  const reviews = Array.isArray(selectedProduct?.reviews) ? selectedProduct.reviews : dummyReviews;

  return (
    <section className="product-reviews">
      <Container>
        <ul>
          <li
            style={{ color: listSelected === "desc" ? "black" : "#9c9b9b" }}
            onClick={() => setListSelected("desc")}
          >
            Description
          </li>
          <li
            style={{ color: listSelected === "rev" ? "black" : "#9c9b9b" }}
            onClick={() => setListSelected("rev")}
          >
            Reviews
          </li>
        </ul>
        {listSelected === "desc" ? (
          <p>{selectedProduct?.description}</p>
        ) : (
          <div className="rates">
            {reviews.length > 0 ? (
              reviews.map((rate, index) => (
                <div className="rate-comment" key={index}>
                  <span>Jhon Doe</span>
                  <span>{rate.rating} (rating)</span>
                  <p>{rate.reviews}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        )}
      </Container>
    </section>
  );
};

export default ProductReviews;
