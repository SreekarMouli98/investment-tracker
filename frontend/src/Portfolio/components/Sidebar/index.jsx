import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DatabaseOutlined,
  DeploymentUnitOutlined,
  DollarCircleOutlined,
  GoldOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';

import './styles.css';

const { Sider } = Layout;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState('');
  const [collapsed, setCollapsed] = useState(true);

  const menuOptions = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LineChartOutlined />,
    },
    {
      key: 'holdings',
      label: 'Holdings',
      icon: <GoldOutlined />,
    },
    {
      key: 'ledger',
      label: 'Ledger',
      icon: <DatabaseOutlined />,
    },
    {
      key: 'integrations',
      label: 'Integrations',
      icon: <DeploymentUnitOutlined />,
    },
  ];

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard')) {
      setSelected('dashboard');
    } else if (location.pathname.startsWith('/holdings')) {
      setSelected('holdings');
    } else if (location.pathname.startsWith('/ledger')) {
      setSelected('ledger');
    } else if (location.pathname.startsWith('/integrations')) {
      setSelected('integrations');
    } else {
      setSelected('');
    }
  }, [location]);

  return (
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
          style={{ height: '64px', marginBottom: '10px' }}
          onClick={() => navigate('/')}
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
  );
}

export default Sidebar;
