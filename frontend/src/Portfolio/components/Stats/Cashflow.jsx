import BarChart from './BarChart';

function Cashflow() {
  const keys = [
    'Canara Bank FD',
    'Zerodha Kite',
    'Smallcsae',
    'Zerodha Coin',
    'Indmoney Mutual Funds',
    'Indmoney US Stocks',
    'Vauld',
    'Wazirx',
  ];
  const data = [
    {
      date: 'Apr 2022',
      'Canara Bank FD': 110000.0,
      'Zerodha Kite': 129666.5,
      Smallcsae: 60886.86,
      'Zerodha Coin': 45997.92,
      'Indmoney Mutual Funds': 11996.88,
      'Indmoney US Stocks': 69429.69,
      Vauld: 10240.0,
      Wazirx: 29427.67,
    },
    {
      date: 'May 2022',
      'Canara Bank FD': 110000.0,
      'Zerodha Kite': 170930.05,
      Smallcsae: 60886.86,
      'Zerodha Coin': 71743.57,
      'Indmoney Mutual Funds': 11996.88,
      'Indmoney US Stocks': 102749.7,
      Vauld: 10240.0,
      Wazirx: 40208.77,
    },
    {
      date: 'Jun 2022',
      'Canara Bank FD': 110000.0,
      'Zerodha Kite': 188636.15,
      Smallcsae: 57551.0,
      'Zerodha Coin': 103741.96,
      'Indmoney Mutual Funds': 4999.95,
      'Indmoney US Stocks': 102958.07,
      Vauld: 10240.0,
      Wazirx: 50005.73,
    },
    {
      date: 'Jul 2022',
      'Canara Bank FD': 110000.0,
      'Zerodha Kite': 251898.5,
      Smallcsae: 57081.04,
      'Zerodha Coin': 149669.67,
      'Indmoney Mutual Funds': 44990.0,
      'Indmoney US Stocks': 102749.7,
      Vauld: 10240.0,
      Wazirx: 50005.73,
    },
  ];
  return <BarChart title="Cashflow" data={data} indexBy="date" keys={keys} />;
}

export default Cashflow;
