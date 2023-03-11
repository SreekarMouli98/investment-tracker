import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import 'antd/dist/antd.dark.css'; // or 'antd/dist/antd.less'
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
