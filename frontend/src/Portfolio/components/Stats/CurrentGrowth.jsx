import SmallStat from "./SmallStat";

const CurrentGrowth = () => {
  let value = 25;
  let suffix = "%";

  return (
    <SmallStat
      title="Current Growth"
      value={value}
      suffix={suffix}
      isChanged={true}
      changedBy="2.37%"
    />
  );
};

export default CurrentGrowth;
