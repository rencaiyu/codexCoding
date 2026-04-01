import { Button, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = { username: "", displayName: "", email: "", passwordHash: "", enabled: true };

export default function UsersPage({ hasPermission }) {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [form] = Form.useForm();

  const fetchUsers = async () => setData((await client.get("/users")).data ?? []);
  const fetchRoles = async () => setRoles((await client.get("/roles")).data ?? []);

  useEffect(() => { fetchUsers(); fetchRoles(); }, []);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) await client.post(`/users/${editing.id}`, values);
    else await client.post("/users", values);
    message.success(editing ? "用户已更新" : "用户已创建");
    setOpen(false); setEditing(null); form.resetFields(); fetchUsers();
  };

  const remove = async (id) => {
    await client.delete(`/users/${id}`); message.success("用户已删除"); fetchUsers();
  };

  const openAssignRoles = async (record) => {
    const response = await client.get(`/users/${record.id}/roles`);
    setAssigningUser(record);
    setSelectedRoleIds(response.data ?? []);
    setAssignOpen(true);
  };

  const submitAssignRoles = async () => {
    await client.post("/users/assign-roles", { userId: assigningUser.id, roleIds: selectedRoleIds });
    message.success("用户角色已更新");
    setAssignOpen(false);
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {hasPermission("users:create") && <Button type="primary" onClick={() => { setEditing(null); form.setFieldsValue(defaultForm); setOpen(true); }}>新增用户</Button>}
      </Space>
      <Table rowKey="id" dataSource={data} pagination={false} columns={[
        { title: "ID", dataIndex: "id" },
        { title: "用户名", dataIndex: "username" },
        { title: "显示名", dataIndex: "displayName" },
        { title: "邮箱", dataIndex: "email" },
        { title: "启用", dataIndex: "enabled", render: (value) => (value ? "是" : "否") },
        {
          title: "操作",
          render: (_, record) => (
            <Space>
              {hasPermission("users:update") && <Button type="link" onClick={() => { setEditing(record); form.setFieldsValue({ ...record, passwordHash: "" }); setOpen(true); }}>编辑</Button>}
              {hasPermission("users:delete") && <Popconfirm title="确认删除?" onConfirm={() => remove(record.id)}><Button danger type="link">删除</Button></Popconfirm>}
              {hasPermission("users:assign") && <Button type="link" onClick={() => openAssignRoles(record)}>分配角色</Button>}
            </Space>
          )
        }
      ]} />

      <Modal title={editing ? "编辑用户" : "新增用户"} open={open} onCancel={() => setOpen(false)} onOk={submit} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="显示名" name="displayName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="邮箱" name="email"><Input /></Form.Item>
          <Form.Item label="密码" name="passwordHash" rules={editing ? [] : [{ required: true }]}><Input /></Form.Item>
          <Form.Item label="启用" name="enabled" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title={`为用户分配角色：${assigningUser?.displayName || ""}`} open={assignOpen} onCancel={() => setAssignOpen(false)} onOk={submitAssignRoles} destroyOnClose>
        <Select mode="multiple" style={{ width: "100%" }} value={selectedRoleIds} onChange={setSelectedRoleIds} options={roles.map((role) => ({ value: role.id, label: `${role.name} (${role.code})` }))} />
      </Modal>
    </>
  );
}
