import { Col, Empty, Row } from 'antd';

function NoData() {
  return (
    <Row align="middle" justify="space-around" style={{ height: '100%' }}>
      <Col>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Col>
    </Row>
  );
}

export default NoData;
