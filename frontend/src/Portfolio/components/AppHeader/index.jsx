import { Layout } from "antd";

import "./styles.css";

const { Header } = Layout;

function AppHeader() {
  return (
    <>
      <Header className="app-header">
        <div>Investment Tracker</div>
      </Header>
    </>
  );
}

export default AppHeader;
