import { Row } from "react-bootstrap";
import { memo } from "react";
import ProductCard from "./ProductCard/ProductCard";

const ShopList = ({ productItems }) => {
  return (
    <Row className="justify-content-center">
      {productItems.map((productItem) => (
        <ProductCard key={productItem._id} productItem={productItem} />
      ))}
    </Row>
  );
};

export default memo(ShopList);
