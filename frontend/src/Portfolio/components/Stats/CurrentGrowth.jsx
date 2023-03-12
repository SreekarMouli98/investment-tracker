import SmallStat from './SmallStat';

function CurrentGrowth() {
  const value = 25;
  const suffix = '%';

  return (
    <SmallStat
      title="Current Growth"
      value={value}
      suffix={suffix}
      isChanged
      changedBy="2.37%"
    />
  );
}

export default CurrentGrowth;
