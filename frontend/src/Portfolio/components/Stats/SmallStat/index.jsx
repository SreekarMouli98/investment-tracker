import AnimatedNumbers from 'react-animated-numbers';
import {
  CaretDownOutlined,
  CaretUpOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';

import StatHeading from '../StatHeading';

function SmallStat({
  title,
  value,
  loading = false,
  currencyLocale = 'en-IN',
  prefix = '',
  suffix = '',
  includeChange = false,
  changeValue,
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
          {loading ? (
            <LoadingOutlined />
          ) : (
            <Row>
              {prefix && <Col>{prefix}</Col>}
              <Col>
                {typeof value === 'number' ? (
                  <AnimatedNumbers
                    includeComma
                    animateToNumber={value}
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
          )}
        </Col>
        {!loading && includeChange && changeValue !== 0 && (
          <Col>
            <Typography
              style={{
                fontSize: '12px',
                fontWeight: 'bolder',
                color: changeValue > 0 ? 'green' : 'red',
                padding: '5px',
              }}
            >
              {changeValue > 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {changeValue}%
            </Typography>
          </Col>
        )}
      </Row>
    </Card>
  );
}

export default SmallStat;
