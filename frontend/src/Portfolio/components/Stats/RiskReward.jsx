import ScatterPlot from "./ScatterPlot";
import SwarmPlot from "./SwarmPlot";

const getRand = (min, max) => Math.ceil(Math.random() * (max - min)) + min;

const RiskReward = () => {
  let data = [
    {
      id: "test",
      data: [
        {
          x: 0,
          y: 0,
          volume: 0,
        },
        {
          x: 1,
          y: 1,
          volume: 20,
        },
        {
          x: 2,
          y: 2,
          volume: 2,
        },
        {
          x: 3,
          y: 3,
          volume: 100,
        },
        {
          x: 4,
          y: 4,
          volume: 0,
        },
      ],
    },
  ];

  const axisFormatter = (num) =>
    ["Very Low", "Low", "Medium", "High", "Very High"][num] || "";

  return (
    <ScatterPlot
      title="Risk Reward"
      data={data}
      xAxisFormatter={axisFormatter}
      yAxisFormatter={axisFormatter}
    />
  );
};

export default RiskReward;
