import { ResponsiveTreeMap } from '@nivo/treemap';
import { Card, Col, Row } from 'antd';

import StatHeading from './StatHeading';

function MyResponsiveTreeMap({ data /* see data tab */ }) {
  return (
    <ResponsiveTreeMap
      data={data}
      identity="name"
      value="loc"
      valueFormat=".02s"
      margin={{ top: 10 }}
      labelSkipSize={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 3]],
      }}
      parentLabelPosition="left"
      parentLabelTextColor={{
        from: 'color',
        modifiers: [['darker', 2]],
      }}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 0.1]],
      }}
      label="id"
      enableParentLabel={false}
    />
  );
}

function AssetsTreeMap() {
  const data = {
    name: 'Stocks',
    children: [
      { name: 'GMMPFAUDLR', loc: 100000000 },
      { name: 'HDFCBANK', loc: 2700000000 },
      { name: 'HDFCLIFE', loc: 4600000000 },
      { name: 'HDFC', loc: 700000000 },
      { name: 'LALPATHLAB', loc: 200000000 },
      { name: 'HINDUNILVR', loc: 300000000 },
      { name: 'WHIRLPOOL', loc: 600000000 },
      { name: 'AUBANK', loc: 1300000000 },
      { name: 'JPPOWER', loc: 21900000000 },
      { name: 'IBULHSGFIN', loc: 10200000000 },
      { name: 'SYMPHONY', loc: 800000000 },
      { name: 'BAJFINANCE', loc: 700000000 },
      { name: 'PIDILITIND', loc: 200000000 },
      { name: 'HAVELLS', loc: 300000000 },
      { name: 'VGUARD', loc: 10000000000 },
      { name: 'CDSL', loc: 300000000 },
      { name: 'ICICIBANK', loc: 700000000 },
      { name: 'HDFCAMC', loc: 1000000000 },
      { name: 'KOTAKBANK', loc: 2500000000 },
      { name: 'BATAINDIA', loc: 300000000 },
      { name: 'AMRUTANJAN', loc: 1300000000 },
      { name: 'CAMS', loc: 300000000 },
      { name: 'DEEPAKNTR', loc: 200000000 },
      { name: 'ASIANPAINT', loc: 700000000 },
      { name: 'IDFCFIRSTB', loc: 19600000000 },
      { name: 'ZOMATO', loc: 22500000000 },
      { name: 'NESTLEIND', loc: 100000000 },
      { name: 'CRAFTSMAN', loc: 0 },
      { name: 'NH', loc: 100000000 },
      { name: 'PNB', loc: 40900000000 },
      { name: 'SUNTV', loc: 0 },
      { name: 'TATASTLLP', loc: 0 },
      { name: 'TCI', loc: 0 },
      { name: 'TCS', loc: 1000000000 },
      { name: 'NAM-INDIA', loc: 5700000000 },
      { name: 'VAIBHAVGBL', loc: 500000000 },
      { name: 'AHLUCONT', loc: 1200000000 },
      { name: 'BLUESTARCO', loc: 200000000 },
      { name: 'CARBORUNIV', loc: 400000000 },
      { name: 'CHALET', loc: 100000000 },
      { name: 'CHEMPLASTS', loc: 100000000 },
      { name: 'CMSINFO', loc: 1200000000 },
      { name: 'CSBBANK', loc: 1200000000 },
      { name: 'CUB', loc: 3100000000 },
      { name: 'DELHIVERY', loc: 100000000 },
      { name: 'DODLA', loc: 1200000000 },
      { name: 'ELGIEQUIP', loc: 800000000 },
      { name: 'ESABINDIA', loc: 100000000 },
      { name: 'FINPIPE', loc: 100000000 },
      { name: 'GOCOLORS', loc: 100000000 },
      { name: 'GRINDWELL', loc: 100000000 },
      { name: 'GRINFRA', loc: 100000000 },
      { name: 'GSFC', loc: 100000000 },
      { name: 'HATSUN', loc: 100000000 },
      { name: 'KNRCON', loc: 100000000 },
      { name: 'LEMONTREE', loc: 100000000 },
      { name: 'MANYAVAR', loc: 200000000 },
      { name: 'NAVINFLUOR', loc: 100000000 },
      { name: 'RAJRATAN', loc: 100000000 },
      { name: 'ROSSARI', loc: 100000000 },
      { name: 'SFL', loc: 200000000 },
      { name: 'TARSONS', loc: 2200000000 },
      { name: 'TIMKEN', loc: 100000000 },
      { name: 'TRITURBINE', loc: 100000000 },
      { name: 'TTKPRESTIG', loc: 300000000 },
      { name: 'VMART', loc: 100000000 },
      { name: 'VSTIND', loc: 300000000 },
      { name: 'ZYDUSWELL', loc: 100000000 },
      { name: 'BECTORFOOD', loc: 500000000 },
      { name: 'MOLDTKPAC', loc: 200000000 },
      { name: 'VRLLOG', loc: 400000000 },
      { name: 'DELTACORP', loc: 1100000000 },
      { name: 'DMART', loc: 400000000 },
      { name: 'RELAXO', loc: 500000000 },
      { name: 'BANKBEES', loc: 5800000000 },
      { name: 'ITBEES', loc: 82000000000 },
    ],
  };

  return (
    <Card
      style={{
        margin: '10px',
      }}
    >
      <Row align="middle">
        <Col span={24}>
          <StatHeading text="Assets" />
        </Col>
        <Col span={24}>
          <div
            style={{
              height: '400px',
              color: 'black',
            }}
          >
            <MyResponsiveTreeMap data={data} />
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default AssetsTreeMap;
