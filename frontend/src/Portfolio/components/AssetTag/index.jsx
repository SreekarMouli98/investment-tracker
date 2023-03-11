import { Tag, Tooltip } from 'antd';
import { observer } from 'mobx-react-lite';

import { useAppStore } from '../../stores/AppStore';
import { truncateStringToLength } from '../../utils';

const AssetTag = observer(({ ticker, name, assetClassId }) => {
  const appStore = useAppStore();

  const assetClass = appStore.getAssetClassById(assetClassId) || {};

  let tagColor;
  switch (assetClass.name) {
    case 'Currency':
      tagColor = 'green';
      break;
    case 'Stock':
      tagColor = 'geekblue';
      break;
    case 'Smallcase':
      tagColor = 'blue';
      break;
    case 'Mutual Fund':
      tagColor = 'cyan';
      break;
    case 'Crypto':
      tagColor = 'gold';
      break;
    case 'Real Estate':
      tagColor = 'magenta';
      break;
    case 'Bond':
      tagColor = 'lime';
      break;
    default:
      break;
  }

  const text = truncateStringToLength(`${assetClass.name} : ${ticker}`, 23);

  return (
    <Tooltip title={name}>
      <div style={{ width: 'min-content' }}>
        <Tag color={tagColor}>{text}</Tag>
      </div>
    </Tooltip>
  );
});

export default AssetTag;
