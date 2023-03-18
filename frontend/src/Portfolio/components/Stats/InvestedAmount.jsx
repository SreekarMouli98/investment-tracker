import { useQuery } from '@apollo/client';

import { GET_INVESTED_AMOUNT } from '../../services';

import SmallStat from './SmallStat';

function InvestedAmount() {
  const { loading, data } = useQuery(GET_INVESTED_AMOUNT, {
    fetchPolicy: 'no-cache',
  });

  const value = parseFloat(data?.investedAmount?.value.toFixed(0));
  const currencyLocale = 'en-IN';
  const prefix = '₹';
  const changeValue = parseFloat(data?.investedAmount?.change.toFixed(2));

  return (
    <SmallStat
      title="Invested Amount"
      value={value !== 0 ? value : '-'}
      loading={loading}
      currencyLocale={currencyLocale}
      prefix={value !== 0 ? prefix : ''}
      includeChange={data?.investedAmount?.change !== 0}
      changeValue={changeValue}
    />
  );
}

export default InvestedAmount;
