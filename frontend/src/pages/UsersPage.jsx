import { Button, Form, Input, Modal, Select, Space, Switch, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = {
  username: "",
  displayName: "",
  email: "",
  passwordHash: "",
  enabled: true
};

export default function UsersPage({ hasPermission }) {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    const response = await client.get("/users");
    setData(response.data);
  };

  const fetchRoles = async () => {
    const response = await client.get("/roles");
    setRoles(response.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await client.post("/users", values);
    message.success("用户已创建");
    setOpen(false);
    form.resetFields();
    fetchUsers();
  };

  const openAssignRoles = async (record) => {
    const response = await client.get(`/users/${record.id}/roles`);
    setAssigningUser(record);
    setSelectedRoleIds(response.data ?? []);
    setAssignOpen(true);
  };

  const submitAssignRoles = async () => {
    await client.post("/users/assign-roles", {
      userId: assigningUser.id,
      roleIds: selectedRoleIds
    });
    message.success("用户角色已更新");
    setAssignOpen(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "用户名", dataIndex: "username" },
    { title: "显示名", dataIndex: "displayName" },
    { title: "邮箱", dataIndex: "email" },
    { title: "启用", dataIndex: "enabled", render: (value) => (value ? "是" : "否") },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        hasPermission("users:assign") ? (
          <Button type="link" onClick={() => openAssignRoles(record)}>
            分配角色
          </Button>
        ) : "-"
      )
    }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {hasPermission("users:create") && (
          <Button type="primary" onClick={() => setOpen(true)}>
            新增用户
          </Button>
        )}
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
          <Form.Item label="密码" name="passwordHash" rules={[{ required: true }]}>
            <Input placeholder="输入密码" />
          </Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`为用户分配角色：${assigningUser?.displayName || ""}`}
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        onOk={submitAssignRoles}
        destroyOnClose
      >
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="选择角色"
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          options={roles.map((role) => ({ value: role.id, label: `${role.name} (${role.code})` }))}
        />
      </Modal>
    </>
  );
}
