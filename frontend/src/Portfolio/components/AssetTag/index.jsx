import { Tag } from "antd";

import { useAppStore } from "../../stores/AppStore";

function AssetTag({ ticker, assetClassId }) {
  const appStore = useAppStore();

  const assetClass = appStore.getAssetClassById(assetClassId) || {};

  let tagColor;
  switch (assetClass.name) {
    case "Currency":
      tagColor = "green";
      break;
    case "Stock":
      tagColor = "geekblue";
      break;
    case "Smallcase":
      tagColor = "blue";
      break;
    case "Mutual Fund":
      tagColor = "cyan";
      break;
    case "Crypto":
      tagColor = "gold";
      break;
    case "Real Estate":
      tagColor = "magenta";
      break;
    case "Bond":
      tagColor = "lime";
      break;
    default:
      break;
  }

  return (
    <div>
      <Tag color={tagColor}>
        {assetClass.name} : {ticker}
      </Tag>
    </div>
  );
}

export default AssetTag;
