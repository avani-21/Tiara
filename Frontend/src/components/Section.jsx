import { Container, Row } from "react-bootstrap";
import ProductCard from "./ProductCard/ProductCard";
import { useState } from "react";

const Section = ({ title, bgColor, productItems }) => {
   

  return (
    <section style={{ background: bgColor,marginLeft:"190px" }}>
      <Container>
        <div className="heading">
          <h1>{title}</h1>
        </div>
        <Row className="justify-content-center">
          {productItems.map((productItem) => {
            return (
              <ProductCard
                key={productItem._id}
                title={title}
                productItem={productItem}
              />
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default Section;
