import SmallStat from './SmallStat';

function TotalHoldings() {
  const value = 1000000;
  const currencyLocale = 'en-IN';
  const prefix = '₹';

  return (
    <SmallStat
      title="Networth"
      value={value}
      isCurrency
      currencyLocale={currencyLocale}
      prefix={prefix}
      isChanged
      changedBy="2.37%"
    />
  );
}

export default TotalHoldings;
