import { formatAssetValue } from "../../utils";
import SmallStat from "./SmallStat";

const UnrealizedProfits = () => {
  let value = 100000;
  let currencyLocale = "en-IN";
  let prefix = "₹";

  return (
    <SmallStat
      title="Unrealized Profits"
      value={value}
      isCurrency={true}
      currencyLocale={currencyLocale}
      prefix={prefix}
      isChanged={true}
      changedBy="2.37%"
    />
  );
};

export default UnrealizedProfits;
