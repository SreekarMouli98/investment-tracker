import { useState } from "react";
import { Button, Layout, Menu } from "antd";
import { DollarCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

import "./styles.css";
import { useEffect } from "react";

const { Sider } = Layout;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState("");
  const [collapsed, setCollapsed] = useState(true);

  const menuOptions = [
    {
      key: "ledger",
      label: "Ledger",
      icon: <FileTextOutlined />,
    },
  ];

  useEffect(() => {
    if (location.pathname.startsWith("/ledger")) {
      setSelected("ledger");
    }
  }, [location]);

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
            navigate(`/${key}`);
          }}
        />
      </Sider>
    </>
  );
}

export default Sidebar;
