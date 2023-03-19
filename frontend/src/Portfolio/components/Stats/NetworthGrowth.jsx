import { useQuery } from '@apollo/client';

import { GET_NETWORTH_GROWTH } from '../../services';

import LineChart from './LineChart';

function NetworthGrowth() {
  const { loading, data } = useQuery(GET_NETWORTH_GROWTH, {
    fetchPolicy: 'no-cache',
  });

  return (
    <LineChart
      title="Networth"
      data={data?.networthGrowth || []}
      loading={loading}
    />
  );
}

export default NetworthGrowth;
