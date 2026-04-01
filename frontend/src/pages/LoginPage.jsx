import { Button, Card, Form, Input, Typography, message } from "antd";
import client, { setAuthToken } from "../api/client.js";

export default function LoginPage({ onLogin }) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const response = await client.post("/auth/login", values);
    setAuthToken(response.data.token);
    onLogin(response.data);
    message.success("登录成功");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #e6f4ff 0%, #f7f9fc 45%, #eef2ff 100%)",
        padding: 24
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 16,
          boxShadow: "0 16px 48px rgba(16, 24, 40, 0.16)",
          border: "1px solid #e6ebf5"
        }}
      >
        <Typography.Text style={{ color: "#4f46e5", fontWeight: 600 }}>WELCOME</Typography.Text>
        <Typography.Title level={3} style={{ marginTop: 8, marginBottom: 6 }}>
          权限管理系统
        </Typography.Title>
        <Typography.Paragraph style={{ color: "#667085", marginBottom: 20 }}>
          请输入账号与密码继续操作
        </Typography.Paragraph>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input size="large" placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block style={{ marginTop: 8 }}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
