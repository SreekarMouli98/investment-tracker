import SmallStat from './SmallStat';

function TotalAssets() {
  const value = 100;

  return (
    <SmallStat
      title="Total Assets"
      value={value}
      isChanged
      changedBy="3"
      positiveChange={false}
    />
  );
}

export default TotalAssets;
