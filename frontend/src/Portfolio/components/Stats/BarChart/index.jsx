import { ResponsiveBar } from "@nivo/bar";
import { Card, Col, Row } from "antd";
import StatHeading from "../StatHeading";

const MyResponsiveBar = ({ data /* see data tab */, indexBy, keys }) => (
  <ResponsiveBar
    data={data}
    keys={keys}
    indexBy={indexBy}
    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
    padding={0.3}
    valueScale={{ type: "linear" }}
    indexScale={{ type: "band", round: true }}
    colors={{ scheme: "nivo" }}
    borderColor={{
      from: "color",
      modifiers: [["darker", 1.6]],
    }}
    axisTop={null}
    axisRight={null}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: -35,
      legend: "",
      legendPosition: "middle",
      legendOffset: 32,
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "",
      legendPosition: "middle",
      legendOffset: -40,
    }}
    labelSkipWidth={12}
    labelSkipHeight={12}
    labelTextColor={{
      from: "color",
      modifiers: [["darker", 1.6]],
    }}
    legends={[
      {
        anchor: "right",
        direction: "column",
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 0,
        itemDirection: "left-to-right",
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: "circle",
        symbolBorderColor: "rgba(0, 0, 0, .5)",
        effects: [
          {
            on: "hover",
            style: {
              itemBackground: "rgba(0, 0, 0, .03)",
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
    role="application"
    ariaLabel="Nivo bar chart demo"
    barAriaLabel={function (e) {
      return e.id + ": " + e.formattedValue + " in country: " + e.indexValue;
    }}
    theme={{
      axis: {
        ticks: {
          line: {
            stroke: "white",
          },
          text: {
            fill: "white",
          },
        },
      },
      legends: {
        text: {
          fill: "white",
        },
      },
    }}
    enableLabel={false}
    enableGridY={false}
  />
);

const BarChart = ({ title, data, indexBy, keys }) => {
  return (
    <Card
      style={{
        margin: "10px",
      }}
    >
      <Row align="middle">
        <Col span={24}>
          <StatHeading text={title} />
        </Col>
        <Col span={24}>
          <div
            style={{
              height: "400px",
              color: "black",
            }}
          >
            <MyResponsiveBar data={data} indexBy={indexBy} keys={keys} />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default BarChart;
