export const generateHexFromString = (str) => {
  /**
   * Function to generate a hex color based on string.
   *
   * Source: https://stackoverflow.com/a/16348977/8208804
   */
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};

const padZero = (str, len) => {
  /**
   * Helper function for `invertColor`.
   *
   * Source: https://stackoverflow.com/a/35970186/8208804
   */
  len = len || 2;
  let zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
};

export const invertColor = (hex, bw) => {
  /**
   * Function to generate a opposite color for a hex.
   *
   * Source: https://stackoverflow.com/a/35970186/8208804
   */
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  let r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
};

export const formatAssetValue = (value, assetType, country) => {
  let prefix = "";
  let formatType = "en-IN";
  if (assetType === "Currency") {
    if (country === "USA") {
      prefix = "$";
      formatType = "en-US";
    } else if (country === "IND") {
      prefix = "₹";
    }
  }
  const formatter = new Intl.NumberFormat(formatType);
  const formattedValue = prefix + formatter.format(value);
  return formattedValue;
};
