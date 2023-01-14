import { Tooltip } from "antd";

import { useAppStore } from "../../stores/AppStore";
import { formatAssetValue } from "../../utils";

function AssetValue({ assetClassId, countryId, value }) {
  const appStore = useAppStore();

  const assetClass = appStore.getAssetClassById(assetClassId);

  const country = appStore.getCountryById(countryId) || {};

  const fullValue = formatAssetValue(value, assetClass.name, country?.code);

  return <Tooltip title={fullValue}>{fullValue}</Tooltip>;
}

export default AssetValue;
