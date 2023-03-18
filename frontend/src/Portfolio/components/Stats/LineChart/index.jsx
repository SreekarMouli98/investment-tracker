import { ResponsiveLine } from '@nivo/line';
import { Card, Col, Row } from 'antd';
import { isEmpty } from 'lodash';

import { useAppStore } from '../../../stores/AppStore';
import NoData from '../../NoData';
import PageLoading from '../../PageLoading';
import StatHeading from '../StatHeading';
import StatTooltip from '../StatTooltip';

function MyResponsiveLine({ data, renderTooltip = undefined }) {
  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -35,
        legend: '',
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        orient: 'left',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: '',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      useMesh
      legends={[
        {
          anchor: 'right',
          direction: 'column',
          justify: false,
          translateX: 100,
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
      curve="natural"
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
      lineWidth={3}
      pointSize={6}
      pointColor="white"
      pointBorderWidth={0}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      enableGridX={false}
      enableGridY={false}
      crosshairType="cross"
      tooltip={renderTooltip}
    />
  );
}

function LineChart({ title, data, loading }) {
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
                <MyResponsiveLine
                  data={data}
                  renderTooltip={({ point }) => (
                    <StatTooltip
                      title={point.data.x}
                      value={point.data.y}
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

export default LineChart;
