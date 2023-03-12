import PieChart from './PieChart';

function AssetClassDiversification() {
  const data = [
    {
      id: 'Crypto',
      name: 'Crypto',
      value: 100000,
    },
    {
      id: 'Indian Stocks',
      name: 'Indian Stocks',
      value: 700000,
    },
    {
      id: 'US Stocks',
      name: 'US Stocks',
      value: 400000,
    },
    {
      id: 'Bonds',
      name: 'Bonds',
      value: 100000,
    },
  ];

  return <PieChart title="Asset Class Diversification" data={data} />;
}

export default AssetClassDiversification;
