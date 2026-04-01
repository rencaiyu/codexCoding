import { Button, Layout, Menu, Space, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import UsersPage from "./pages/UsersPage.jsx";
import RolesPage from "./pages/RolesPage.jsx";
import PermissionsPage from "./pages/PermissionsPage.jsx";
import MenusPage from "./pages/MenusPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import client, { setAuthToken } from "./api/client.js";

const { Header, Content, Sider } = Layout;

const fallbackMenus = [
  { key: "users", label: "用户管理" },
  { key: "roles", label: "角色管理" },
  { key: "menus", label: "菜单管理" },
  { key: "permissions", label: "按钮权限管理" }
];

export default function App() {
  const [activeKey, setActiveKey] = useState("users");
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [menuItems, setMenuItems] = useState(fallbackMenus);
  const [allowedMenus, setAllowedMenus] = useState(fallbackMenus.map((item) => item.key));
  const [permissionSet, setPermissionSet] = useState(new Set());
  const [checking, setChecking] = useState(true);

  const fetchMenuItems = async () => {
    const response = await client.get("/menus");
    const items = (response.data ?? []).map((menu) => ({ key: menu.menuKey, label: menu.name }));
    setMenuItems(items.length ? items : fallbackMenus);
  };

  const fetchAllowedMenus = async () => {
    try {
      const response = await client.get("/auth/menus");
      const menus = response.data?.menus ?? [];
      setAllowedMenus(menus);
      if (menus.length > 0 && !menus.includes(activeKey)) setActiveKey(menus[0]);
    } catch {
      setAllowedMenus(fallbackMenus.map((item) => item.key));
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await client.get("/auth/permissions");
      setPermissionSet(new Set(response.data?.permissions ?? []));
    } catch {
      setPermissionSet(new Set());
    }
  };

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
        await Promise.all([fetchMenuItems(), fetchAllowedMenus(), fetchPermissions()]);
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
    setPermissionSet(new Set());
    setAllowedMenus(fallbackMenus.map((item) => item.key));
    setActiveKey("users");
    message.success("已退出登录");
  };

  const hasPermission = (permissionKey) => permissionSet.has(permissionKey);

  const content = useMemo(() => {
    switch (activeKey) {
      case "roles":
        return <RolesPage hasPermission={hasPermission} />;
      case "menus":
        return <MenusPage hasPermission={hasPermission} />;
      case "permissions":
        return <PermissionsPage hasPermission={hasPermission} />;
      default:
        return <UsersPage hasPermission={hasPermission} />;
    }
  }, [activeKey, permissionSet]);

  if (checking) return null;

  if (!authenticated) {
    return (
      <LoginPage
        onLogin={async (payload) => {
          setAuthenticated(true);
          setUserInfo(payload);
          await Promise.all([fetchMenuItems(), fetchAllowedMenus(), fetchPermissions()]);
        }}
      />
    );
  }

  const visibleMenuItems = menuItems.filter((item) => allowedMenus.includes(item.key));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: "#fff", padding: 16, fontWeight: 600 }}>权限管理系统</div>
        <Menu theme="dark" mode="inline" selectedKeys={[activeKey]} items={visibleMenuItems} onClick={(event) => setActiveKey(event.key)} />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{menuItems.find((item) => item.key === activeKey)?.label}</Typography.Title>
          <Space>
            <Typography.Text>{userInfo?.displayName || userInfo?.username || "已登录"}</Typography.Text>
            <Button onClick={handleLogout}>退出登录</Button>
          </Space>
        </Header>
        <Content style={{ margin: 24, background: "#fff", padding: 24 }}>{content}</Content>
      </Layout>
    </Layout>
  );
}
