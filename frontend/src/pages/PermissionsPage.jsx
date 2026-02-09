import { Button, Form, Input, Modal, Space, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = {
  code: "",
  name: "",
  description: "",
  resource: "",
  action: ""
};

export default function PermissionsPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchPermissions = async () => {
    const response = await client.get("/permissions");
    setData(response.data);
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await client.post("/permissions", values);
    message.success("权限已创建");
    setOpen(false);
    form.resetFields();
    fetchPermissions();
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "编码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    { title: "资源", dataIndex: "resource" },
    { title: "动作", dataIndex: "action" },
    { title: "描述", dataIndex: "description" }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增权限
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      <Modal
        title="新增权限"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item label="编码" name="code" rules={[{ required: true }]}> 
            <Input placeholder="输入权限编码" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}> 
            <Input placeholder="输入权限名称" />
          </Form.Item>
          <Form.Item label="资源" name="resource" rules={[{ required: true }]}> 
            <Input placeholder="输入资源标识" />
          </Form.Item>
          <Form.Item label="动作" name="action" rules={[{ required: true }]}> 
            <Input placeholder="输入动作" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input placeholder="输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
