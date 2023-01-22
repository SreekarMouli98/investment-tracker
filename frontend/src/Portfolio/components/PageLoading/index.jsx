import { Col, Row, Spin } from "antd";

const PageLoading = () => (
  <Row align="middle" justify="space-around" style={{ height: "100%" }}>
    <Col>
      <Spin tip="Loading" />
    </Col>
  </Row>
);

export default PageLoading;
