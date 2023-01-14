import { Tag } from "antd";

import { useAppStore } from "../../stores/AppStore";
import { generateHexFromString, invertColor } from "../../utils";

function AssetTag({ ticker, assetClassId }) {
  const appStore = useAppStore();

  const assetClass = appStore.getAssetClassById(assetClassId) || {};

  const tagColor = generateHexFromString(assetClass.name || "random-text");

  const textColor = invertColor(tagColor);

  return (
    <div>
      <Tag color={tagColor} style={{ color: textColor, fontWeight: "bold" }}>
        {assetClass.name} : {ticker}
      </Tag>
    </div>
  );
}

export default AssetTag;
