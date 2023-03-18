import { useQuery } from '@apollo/client';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { Card, Col, Row } from 'antd';
import { isEmpty } from 'lodash';

import { GET_ASSETS_TREE_MAP } from '../../services';
import { useAppStore } from '../../stores/AppStore';
import NoData from '../NoData';
import PageLoading from '../PageLoading';

import StatHeading from './StatHeading';
import StatTooltip from './StatTooltip';

function MyResponsiveTreeMap({ data, renderTooltip = undefined }) {
  return (
    <ResponsiveTreeMap
      data={data}
      identity="name"
      value="loc"
      valueFormat=".02s"
      margin={{ top: 10 }}
      labelSkipSize={30}
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
      tooltip={renderTooltip}
    />
  );
}

function AssetsTreeMap() {
  const appStore = useAppStore();
  const { baseAsset } = appStore;
  const { loading, data } = useQuery(GET_ASSETS_TREE_MAP, {
    fetchPolicy: 'no-cache',
  });

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
            {(() => {
              if (loading) {
                return <PageLoading />;
              }
              if (isEmpty(data?.assetsTreeMap)) {
                return <NoData />;
              }
              return (
                <MyResponsiveTreeMap
                  data={data?.assetsTreeMap || {}}
                  renderTooltip={({ node }) => (
                    <StatTooltip
                      title={node.label}
                      value={node.value}
                      assetClass={baseAsset?.assetClass?.name}
                      country={baseAsset?.country?.code}
                    />
                  )}
                />
              );
            })()}
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default AssetsTreeMap;
