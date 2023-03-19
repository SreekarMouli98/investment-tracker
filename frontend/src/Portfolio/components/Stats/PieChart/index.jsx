import { ResponsivePie } from '@nivo/pie';
import { Card, Col, Row } from 'antd';
import { isEmpty } from 'lodash';

import { useAppStore } from '../../../stores/AppStore';
import NoData from '../../NoData';
import PageLoading from '../../PageLoading';
import StatHeading from '../StatHeading';
import StatTooltip from '../StatTooltip';

function MyResponsivePie({
  data,
  renderLabel = undefined,
  renderTooltip = undefined,
}) {
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={2}
      cornerRadius={3}
      activeInnerRadiusOffset={10}
      activeOuterRadiusOffset={10}
      borderWidth={1}
      borderColor={{
        from: 'color',
        modifiers: [['darker', 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="white"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [['darker', 3]],
      }}
      legends={[
        {
          anchor: 'right',
          direction: 'column',
          justify: false,
          translateX: 50,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      theme={{
        axis: {
          ticks: {
            line: {
              stroke: 'white',
            },
            text: {
              fill: 'white',
            },
          },
        },
        legends: {
          text: {
            fill: 'white',
          },
        },
      }}
      tooltip={renderTooltip}
      arcLabel={renderLabel}
    />
  );
}

function PieChart({ title, data, loading }) {
  const appStore = useAppStore();
  const { baseAsset } = appStore;

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
              if (isEmpty(data)) {
                return <NoData />;
              }
              return (
                <MyResponsivePie
                  data={data}
                  renderLabel={(item) => {
                    return `${item.data.percentage.toFixed(0)}%`;
                  }}
                  renderTooltip={({ datum }) => (
                    <StatTooltip
                      title={datum.id}
                      value={datum.value}
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

export default PieChart;
