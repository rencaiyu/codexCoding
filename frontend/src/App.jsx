import { Button, Layout, Menu, Space, Typography, message } from "antd";
import { useEffect, useState } from "react";
import UsersPage from "./pages/UsersPage.jsx";
import RolesPage from "./pages/RolesPage.jsx";
import PermissionsPage from "./pages/PermissionsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import client, { setAuthToken } from "./api/client.js";

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
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        await client.get("/auth/validate");
        setAuthenticated(true);
      } catch {
        setAuthToken(null);
      } finally {
        setChecking(false);
      }
    };
    checkToken();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setAuthenticated(false);
    setUserInfo(null);
    message.success("已退出登录");
  };

  if (checking) {
    return null;
  }

  if (!authenticated) {
    return (
      <LoginPage
        onLogin={(payload) => {
          setAuthenticated(true);
          setUserInfo(payload);
        }}
      />
    );
  }

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
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {menuItems.find((item) => item.key === activeKey)?.label}
          </Typography.Title>
          <Space>
            <Typography.Text>{userInfo?.displayName || userInfo?.username || "已登录"}</Typography.Text>
            <Button onClick={handleLogout}>退出登录</Button>
          </Space>
        </Header>
        <Content style={{ margin: 24, background: "#fff", padding: 24 }}>
          {renderContent(activeKey)}
        </Content>
      </Layout>
    </Layout>
  );
}
