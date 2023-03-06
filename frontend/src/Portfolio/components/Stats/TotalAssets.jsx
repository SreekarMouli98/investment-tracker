import SmallStat from "./SmallStat";

const TotalAssets = () => {
  let value = 100;

  return (
    <SmallStat
      title="Total Assets"
      value={value}
      isChanged={true}
      changedBy="3"
      positiveChange={false}
    />
  );
};

export default TotalAssets;
