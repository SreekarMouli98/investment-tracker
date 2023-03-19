import { Card, Typography } from 'antd';

import { formatAssetValue } from '../../../utils';

function StatTooltip({ title, value, assetClass, country }) {
  const val = formatAssetValue(value, assetClass, country);
  return (
    <Card>
      <Typography>{title}</Typography>
      <Typography.Title level={5}>{val}</Typography.Title>
    </Card>
  );
}

export default StatTooltip;
