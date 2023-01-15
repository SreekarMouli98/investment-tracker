export const formatAssetValue = (value, assetType, country, precision = 2) => {
  let prefix = "";
  let formatType = "en-IN";
  if (assetType === "Currency") {
    if (country === "USA") {
      prefix = "$";
      formatType = "en-US";
    } else if (country === "IND") {
      prefix = "₹";
    }
  } else if (assetType === "Crypto") {
    formatType = "en-US";
  }
  const formatter = new Intl.NumberFormat(formatType, {
    minimumFractionDigits: precision,
  });
  const formattedValue = prefix + formatter.format(value);
  return formattedValue;
};
