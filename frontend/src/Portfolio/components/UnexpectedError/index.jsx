import { Col, Result, Row } from 'antd';

function UnexpectedError() {
  return (
    <Row align="middle" justify="space-around" style={{ height: '100%' }}>
      <Col>
        <Result
          status="error"
          title="Unexpected Error"
          subTitle="Please try again later"
        />
      </Col>
    </Row>
  );
}

export default UnexpectedError;
