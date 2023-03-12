import { Tooltip } from 'antd';
import { observer } from 'mobx-react-lite';

import { useAppStore } from '../../stores/AppStore';
import { formatAssetValue } from '../../utils';

const AssetValue = observer(
  ({ assetClassId, assetTicker, countryId, value, valueInBase }) => {
    const appStore = useAppStore();

    const { baseAsset } = appStore;

    const showBaseConversion = assetTicker !== baseAsset.ticker;

    const assetClass = appStore.getAssetClassById(assetClassId);

    if (!assetClass) return <>?</>;

    const country = appStore.getCountryById(countryId) || {};

    const fullValue = formatAssetValue(
      value,
      assetClass.name,
      country?.code,
      assetClass.decimalPlaces,
    );

    const shortValue = formatAssetValue(value, assetClass.name, country?.code);

    let fullValueInBase;
    let shortValueInBase;

    if (showBaseConversion) {
      fullValueInBase = formatAssetValue(
        valueInBase,
        baseAsset.assetClass.name,
        baseAsset.country.code,
        baseAsset.assetClass.decimalPlaces,
      );

      shortValueInBase = formatAssetValue(
        valueInBase,
        baseAsset.assetClass.name,
        baseAsset.country.code,
      );
    }

    return (
      <div>
        <Tooltip title={fullValue}>
          <span>{shortValue}</span>
        </Tooltip>
        {showBaseConversion && (
          <>
            <br />
            <Tooltip title={fullValueInBase}>
              <span
                style={{
                  fontStyle: 'italic',
                  fontWeight: 'lighter',
                  fontSize: 'small',
                }}
              >
                {shortValueInBase}
              </span>
            </Tooltip>
          </>
        )}
      </div>
    );
  },
);

export default AssetValue;
