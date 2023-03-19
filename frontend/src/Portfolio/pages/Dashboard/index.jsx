import { Col, Row } from 'antd';

import {
  AssetClassDiversification,
  AssetsTreeMap,
  Cashflow,
  InvestedAmount,
  NetworthGrowth,
  PresentValue,
  RiskReward,
  TotalAssets,
  UnrealizedProfits,
} from '../../components/Stats';

function Dashboard() {
  return (
    <div
      style={{
        padding: '20px',
      }}
    >
      <Row>
        <Col md={12} lg={6}>
          <InvestedAmount />
        </Col>
        <Col md={12} lg={6}>
          <PresentValue />
        </Col>
        <Col md={12} lg={6}>
          <UnrealizedProfits />
        </Col>
        <Col md={12} lg={6}>
          <TotalAssets />
        </Col>
        <Col md={24} lg={12}>
          <AssetClassDiversification />
        </Col>
        <Col md={24} lg={12}>
          <NetworthGrowth />
        </Col>
        <Col md={24} lg={12}>
          <Cashflow />
        </Col>
        <Col md={24} lg={12}>
          <RiskReward />
        </Col>
        <Col lg={24}>
          <AssetsTreeMap />
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
