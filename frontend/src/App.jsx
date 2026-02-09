import { Layout, Menu, Typography } from "antd";
import { useState } from "react";
import UsersPage from "./pages/UsersPage.jsx";
import RolesPage from "./pages/RolesPage.jsx";
import PermissionsPage from "./pages/PermissionsPage.jsx";

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: "users", label: "用户管理" },
  { key: "roles", label: "角色管理" },
  { key: "permissions", label: "权限管理" }
];

const renderContent = (activeKey) => {
  switch (activeKey) {
    case "roles":
      return <RolesPage />;
    case "permissions":
      return <PermissionsPage />;
    default:
      return <UsersPage />;
  }
};

export default function App() {
  const [activeKey, setActiveKey] = useState("users");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: "#fff", padding: 16, fontWeight: 600 }}>
          权限管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={(event) => setActiveKey(event.key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {menuItems.find((item) => item.key === activeKey)?.label}
          </Typography.Title>
        </Header>
        <Content style={{ margin: 24, background: "#fff", padding: 24 }}>
          {renderContent(activeKey)}
        </Content>
      </Layout>
    </Layout>
  );
}
