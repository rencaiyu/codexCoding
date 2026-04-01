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
        background: "#f5f7fb"
      }}
    >
      <Card style={{ width: 360 }}>
        <Typography.Title level={4}>登录系统</Typography.Title>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
