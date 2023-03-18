import { useQuery } from '@apollo/client';

import { GET_ASSET_CLASS_DIVERSIFICATION } from '../../services';

import PieChart from './PieChart';

function AssetClassDiversification() {
  const { loading, data } = useQuery(GET_ASSET_CLASS_DIVERSIFICATION, {
    fetchPolicy: 'no-cache',
  });

  return (
    <PieChart
      title="Asset Class Diversification"
      data={data?.assetClassDiversification || []}
      loading={loading}
    />
  );
}

export default AssetClassDiversification;
