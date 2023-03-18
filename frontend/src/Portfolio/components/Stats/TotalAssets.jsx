import { useQuery } from '@apollo/client';

import { GET_TOTAL_ASSETS } from '../../services';

import SmallStat from './SmallStat';

function TotalAssets() {
  const { loading, data } = useQuery(GET_TOTAL_ASSETS, {
    fetchPolicy: 'no-cache',
  });

  const value = data?.totalAssets?.value;
  const changeValue = parseFloat(data?.totalAssets?.change.toFixed(2));

  return (
    <SmallStat
      title="Total Assets"
      value={value !== 0 ? value : '-'}
      loading={loading}
      includeChange={data?.totalAssets?.change !== 0}
      changeValue={changeValue}
    />
  );
}

export default TotalAssets;
