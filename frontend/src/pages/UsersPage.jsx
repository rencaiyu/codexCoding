import { Button, Form, Input, Modal, Space, Switch, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = {
  username: "",
  displayName: "",
  email: "",
  passwordHash: "",
  enabled: true
};

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    const response = await client.get("/users");
    setData(response.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await client.post("/users", values);
    message.success("用户已创建");
    setOpen(false);
    form.resetFields();
    fetchUsers();
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "用户名", dataIndex: "username" },
    { title: "显示名", dataIndex: "displayName" },
    { title: "邮箱", dataIndex: "email" },
    { title: "启用", dataIndex: "enabled", render: (value) => (value ? "是" : "否") }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增用户
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      <Modal
        title="新增用户"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}> 
            <Input placeholder="输入用户名" />
          </Form.Item>
          <Form.Item label="显示名" name="displayName" rules={[{ required: true }]}> 
            <Input placeholder="输入显示名" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input placeholder="输入邮箱" />
          </Form.Item>
          <Form.Item label="密码哈希" name="passwordHash" rules={[{ required: true }]}> 
            <Input placeholder="输入密码哈希" />
          </Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
