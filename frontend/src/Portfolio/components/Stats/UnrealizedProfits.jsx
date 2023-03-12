import SmallStat from './SmallStat';

function UnrealizedProfits() {
  const value = 100000;
  const currencyLocale = 'en-IN';
  const prefix = '₹';

  return (
    <SmallStat
      title="Unrealized Profits"
      value={value}
      isCurrency
      currencyLocale={currencyLocale}
      prefix={prefix}
      isChanged
      changedBy="2.37%"
    />
  );
}

export default UnrealizedProfits;
