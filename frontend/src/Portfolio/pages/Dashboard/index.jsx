import { Col, Row } from 'antd';

import {
  AssetClassDiversification,
  AssetsTreeMap,
  Cashflow,
  CurrentGrowth,
  Networth,
  ProgressChart,
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
          <Networth />
        </Col>
        <Col md={12} lg={6}>
          <CurrentGrowth />
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
          <ProgressChart />
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
