import { Col, Container, Row } from "react-bootstrap";
import "./slidercard.css";
import { useNavigate } from "react-router-dom";

const SlideCard = ({title,desc,cover}) => {
  const navigate=useNavigate()
  return (
      <Container className='box' fluid style={{ maxWidth: '100%', padding: 0 }}>
        <Row>
          <Col md={6}>
            <h1>{title}</h1>
            <p>{desc}</p>
            <button className='btn' >Visit Collections</button>
          </Col>
          <Col md={6}>
            <img src={cover} alt="#" />
          </Col>
        </Row>

    </Container>
  )
}

export default SlideCard
