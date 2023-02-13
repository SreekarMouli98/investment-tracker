import moment from "moment";

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

export const normalizeDate = (date) => {
  return moment(date)
    .utc()
    .set("hour", 0)
    .set("minute", 0)
    .set("second", 0)
    .set("millisecond", 0)
    .format();
};

export const truncateStringToLength = (str, length) => {
  if (!str) {
    return "";
  }
  if (str.length > length) {
    return str.slice(0, length - 3) + "...";
  }
  return str;
};
