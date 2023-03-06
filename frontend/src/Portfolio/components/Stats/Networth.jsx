import SmallStat from "./SmallStat";

const TotalHoldings = () => {
  let value = 1000000;
  let currencyLocale = "en-IN";
  let prefix = "₹";

  return (
    <SmallStat
      title="Networth"
      value={value}
      isCurrency={true}
      currencyLocale={currencyLocale}
      prefix={prefix}
      isChanged={true}
      changedBy="2.37%"
    />
  );
};

export default TotalHoldings;
