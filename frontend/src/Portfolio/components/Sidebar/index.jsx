import { useState } from "react";
import { Button, Layout, Menu } from "antd";
import {
  AreaChartOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import "./styles.css";

const { Sider } = Layout;

function Sidebar() {
  const [selected, setSelected] = useState("");
  const [collapsed, setCollapsed] = useState(true);

  const menuOptions = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <AreaChartOutlined />,
    },
    {
      key: "ledger",
      label: "Ledger",
      icon: <FileTextOutlined />,
    },
  ];

  return (
    <>
      <Sider
        className="app-sidebar"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div>
          <Button
            icon={<DollarCircleOutlined />}
            type="link"
            block
            style={{ height: "64px", marginBottom: "10px" }}
          />
        </div>
        <Menu
          className="app-sidebar-menu"
          mode="inline"
          items={menuOptions}
          selectedKeys={[selected]}
          onSelect={({ key }) => {
            setSelected(key);
          }}
        />
      </Sider>
    </>
  );
}

export default Sidebar;
