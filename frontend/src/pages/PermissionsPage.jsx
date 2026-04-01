import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = {
  code: "",
  name: "",
  description: "",
  resource: "users",
  action: "view"
};

const menuOptions = [
  { label: "用户管理", value: "users" },
  { label: "角色管理", value: "roles" },
  { label: "菜单与按钮权限", value: "permissions" }
];

const actionOptions = [
  { label: "菜单访问(view)", value: "view" },
  { label: "新增(create)", value: "create" },
  { label: "分配(assign)", value: "assign" },
  { label: "编辑(update)", value: "update" },
  { label: "删除(delete)", value: "delete" }
];

export default function PermissionsPage({ hasPermission }) {
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
    message.success("菜单/按钮权限已创建");
    setOpen(false);
    form.resetFields();
    fetchPermissions();
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "权限编码", dataIndex: "code" },
    { title: "菜单/按钮名称", dataIndex: "name" },
    { title: "菜单路由", dataIndex: "resource" },
    {
      title: "按钮动作",
      dataIndex: "action",
      render: (value) => <Tag color={value === "view" ? "blue" : "green"}>{value}</Tag>
    },
    { title: "描述", dataIndex: "description" }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {hasPermission("permissions:create") && (
          <Button type="primary" onClick={() => setOpen(true)}>
            新增菜单/按钮权限
          </Button>
        )}
      </Space>
      <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      <Modal
        title="新增菜单/按钮权限"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item label="权限编码" name="code" rules={[{ required: true }]}> 
            <Input placeholder="示例：users:create" />
          </Form.Item>
          <Form.Item label="菜单/按钮名称" name="name" rules={[{ required: true }]}> 
            <Input placeholder="示例：新增用户按钮" />
          </Form.Item>
          <Form.Item label="菜单路由(resource)" name="resource" rules={[{ required: true }]}> 
            <Select options={menuOptions} />
          </Form.Item>
          <Form.Item label="按钮动作(action)" name="action" rules={[{ required: true }]}> 
            <Select options={actionOptions} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input placeholder="输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
