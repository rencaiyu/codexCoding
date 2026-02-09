import { Button, Form, Input, Modal, Space, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = {
  code: "",
  name: "",
  description: ""
};

export default function RolesPage() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    const response = await client.get("/roles");
    setData(response.data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await client.post("/roles", values);
    message.success("角色已创建");
    setOpen(false);
    form.resetFields();
    fetchRoles();
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "编码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "description" }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增角色
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      <Modal
        title="新增角色"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item label="编码" name="code" rules={[{ required: true }]}> 
            <Input placeholder="输入角色编码" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}> 
            <Input placeholder="输入角色名称" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input placeholder="输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
