import { Tooltip } from "antd";

import { useAppStore } from "../../stores/AppStore";
import { formatAssetValue } from "../../utils";

function AssetValue({
  assetClassId,
  assetTicker,
  countryId,
  value,
  valueInBase,
}) {
  const appStore = useAppStore();

  const assetClass = appStore.getAssetClassById(assetClassId);

  if (!assetClass) return <>?</>;

  const baseAssetClass = appStore.getAssetClassByName("Currency");

  const country = appStore.getCountryById(countryId) || {};

  const fullValue = formatAssetValue(
    value,
    assetClass.name,
    country?.code,
    assetClass.decimalPlaces
  );

  const shortValue = formatAssetValue(value, assetClass.name, country?.code);

  let fullValueInBase, shortValueInBase;

  if (assetTicker !== "INR") {
    fullValueInBase = formatAssetValue(
      valueInBase,
      baseAssetClass.name,
      "IND",
      baseAssetClass.decimalPlaces
    );

    shortValueInBase = formatAssetValue(
      valueInBase,
      baseAssetClass.name,
      "IND"
    );
  }

  return (
    <div>
      <Tooltip title={fullValue}>
        <span>{shortValue}</span>
      </Tooltip>
      {assetTicker !== "INR" && (
        <>
          <br />
          <Tooltip title={fullValueInBase}>
            <span
              style={{
                fontStyle: "italic",
                fontWeight: "lighter",
                fontSize: "small",
              }}
            >
              {shortValueInBase}
            </span>
          </Tooltip>
        </>
      )}
    </div>
  );
}

export default AssetValue;
