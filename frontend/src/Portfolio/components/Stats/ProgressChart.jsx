import LineChart from './LineChart';

function ProgressChart() {
  const data = [
    {
      id: 'Networth',
      data: [
        {
          x: 'Apr 2022',
          y: 1067894.15,
        },
        {
          x: 'May 2022',
          y: 1177480.2,
        },
        {
          x: 'Jun 2022',
          y: 1239289.31,
        },
        {
          x: 'Jul 2022',
          y: 1393916.51,
        },
        {
          x: 'Aug 2022',
          y: 1389327.79,
        },
        {
          x: 'Sep 2022',
          y: 1587001.1,
        },
        {
          x: 'Oct 2022',
          y: 1729027.25,
        },
        {
          x: 'Nov 2022',
          y: 1758843.49,
        },
        {
          x: 'Dec 2022',
          y: 1791893.83,
        },
        {
          x: 'Jan 2023',
          y: 1882453.96,
        },
        {
          x: 'Feb 2023',
          y: 1948038.04,
        },
      ],
    },
    {
      id: 'Invested Amt',
      data: [
        {
          x: 'Apr 2022',
          y: 468179.42,
        },
        {
          x: 'May 2022',
          y: 579545.95,
        },
        {
          x: 'Jun 2022',
          y: 628924.58,
        },
        {
          x: 'Jul 2022',
          y: 777424.76,
        },
        {
          x: 'Aug 2022',
          y: 656193.72,
        },
        {
          x: 'Sep 2022',
          y: 842626.51,
        },
        {
          x: 'Oct 2022',
          y: 934653.98,
        },
        {
          x: 'Nov 2022',
          y: 1461726.03,
        },
        {
          x: 'Dec 2022',
          y: 1573844.56,
        },
        {
          x: 'Jan 2023',
          y: 1676436.94,
        },
        {
          x: 'Feb 2023',
          y: 1731543.99,
        },
      ],
    },
  ];

  return <LineChart title="Networth Growth" data={data} />;
}

export default ProgressChart;
