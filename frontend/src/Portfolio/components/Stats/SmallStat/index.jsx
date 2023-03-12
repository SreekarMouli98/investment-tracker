import AnimatedNumbers from 'react-animated-numbers';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';

import StatHeading from '../StatHeading';

function SmallStat({
  title,
  value,
  isCurrency = false,
  currencyLocale = 'en-IN',
  prefix = '',
  suffix = '',
  isChanged = false,
  changedBy,
  positiveChange = true,
}) {
  return (
    <Card
      style={{
        margin: '10px',
      }}
    >
      <Row align="middle">
        <Col span={24}>
          <StatHeading text={title} />
        </Col>
        <Col style={{ fontSize: '24px', fontWeight: 'bolder' }}>
          <Row>
            {prefix && <Col>{prefix}</Col>}
            <Col>
              {typeof value === 'number' ? (
                <AnimatedNumbers
                  includeComma={isCurrency}
                  animateToNumber={value}
                  // fontStyle={{ fontSize: 24, fontWeight: "bolder" }}
                  locale={currencyLocale}
                  configs={[
                    { mass: 1, tension: 130, friction: 40 },
                    { mass: 2, tension: 140, friction: 40 },
                    { mass: 3, tension: 130, friction: 40 },
                  ]}
                />
              ) : (
                <Typography>{value}</Typography>
              )}
            </Col>
            {suffix && <Col>{suffix}</Col>}
          </Row>
        </Col>
        {isChanged && (
          <Col>
            <Typography
              style={{
                fontSize: '12px',
                fontWeight: 'bolder',
                color: positiveChange ? 'green' : 'red',
                padding: '5px',
              }}
            >
              {positiveChange ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {changedBy}
            </Typography>
          </Col>
        )}
      </Row>
    </Card>
  );
}

export default SmallStat;
