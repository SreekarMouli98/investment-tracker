import { ResponsiveScatterPlotCanvas } from "@nivo/scatterplot";
import { Card, Col, Row } from "antd";
import StatHeading from "../StatHeading";

const MyResponsiveScatterPlotCanvas = ({
  data /* see data tab */,
  xAxisFormatter,
  yAxisFormatter,
}) => (
  <ResponsiveScatterPlotCanvas
    data={data}
    margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
    xScale={{ type: "linear", min: 0, max: "auto" }}
    xFormat=">-.2f"
    yScale={{ type: "linear", min: 0, max: "auto" }}
    yFormat=">-.2f"
    nodeSize={(item) => item.data.volume}
    axisTop={null}
    axisRight={null}
    axisBottom={{
      orient: "bottom",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: -35,
      legend: "Reward",
      legendPosition: "middle",
      legendOffset: 65,
      format: xAxisFormatter,
    }}
    axisLeft={{
      orient: "left",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Risk",
      legendPosition: "middle",
      legendOffset: -75,
      format: yAxisFormatter,
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
        legend: {
          text: {
            fill: "grey",
          },
        },
      },
      legends: {
        text: {
          fill: "white",
        },
      },
    }}
    enableGridX={false}
    enableGridY={false}
  />
);

const ScatterPlot = ({
  title,
  data,
  xAxisFormatter = (val) => val,
  yAxisFormatter = (val) => val,
}) => {
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
            <MyResponsiveScatterPlotCanvas
              data={data}
              xAxisFormatter={xAxisFormatter}
              yAxisFormatter={yAxisFormatter}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ScatterPlot;
