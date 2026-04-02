import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = { code: "", name: "", description: "" };

export default function RolesPage({ hasPermission }) {
  const [data, setData] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [menus, setMenus] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningRole, setAssigningRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [form] = Form.useForm();

  const fetchRoles = async () => setData((await client.get("/roles")).data ?? []);
  const fetchPermissions = async () => {
    const items = (await client.get("/permissions")).data ?? [];
    setPermissions(items.filter((item) => item.permissionType === "BUTTON"));
  };
  const fetchMenus = async () => setMenus((await client.get("/menus")).data ?? []);

  useEffect(() => { fetchRoles(); fetchPermissions(); fetchMenus(); }, []);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) await client.post(`/roles/${editing.id}`, values);
    else await client.post("/roles", values);
    message.success(editing ? "角色已更新" : "角色已创建");
    setOpen(false); setEditing(null); form.resetFields(); fetchRoles();
  };

  const remove = async (id) => {
    await client.delete(`/roles/${id}`); message.success("角色已删除"); fetchRoles();
  };

  const openAssignPermissions = async (record) => {
    const [permissionResp, menuResp] = await Promise.all([
      client.get(`/roles/${record.id}/permissions`),
      client.get(`/roles/${record.id}/menus`)
    ]);
    setAssigningRole(record);
    setSelectedPermissionIds(permissionResp.data ?? []);
    setSelectedMenuIds(menuResp.data ?? []);
    setAssignOpen(true);
  };

  const submitAssign = async () => {
    await Promise.all([
      client.post("/roles/assign-permissions", { roleId: assigningRole.id, permissionIds: selectedPermissionIds }),
      client.post("/roles/assign-menus", { roleId: assigningRole.id, menuIds: selectedMenuIds })
    ]);
    message.success("角色菜单与按钮权限已更新");
    setAssignOpen(false);
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {hasPermission("roles:create") && <Button type="primary" onClick={() => { setEditing(null); form.setFieldsValue(defaultForm); setOpen(true); }}>新增角色</Button>}
      </Space>
      <Table rowKey="id" dataSource={data} pagination={false} columns={[
        { title: "ID", dataIndex: "id" },
        { title: "编码", dataIndex: "code" },
        { title: "名称", dataIndex: "name" },
        { title: "描述", dataIndex: "description" },
        {
          title: "操作",
          render: (_, record) => (
            <Space>
              {hasPermission("roles:update") && <Button type="link" onClick={() => { setEditing(record); form.setFieldsValue(record); setOpen(true); }}>编辑</Button>}
              {hasPermission("roles:delete") && <Popconfirm title="确认删除?" onConfirm={() => remove(record.id)}><Button danger type="link">删除</Button></Popconfirm>}
              {hasPermission("roles:assign") && <Button type="link" onClick={() => openAssignPermissions(record)}>分配菜单/按钮权限</Button>}
            </Space>
          )
        }
      ]} />

      <Modal title={editing ? "编辑角色" : "新增角色"} open={open} onCancel={() => setOpen(false)} onOk={submit} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item label="编码" name="code" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="描述" name="description"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title={`分配权限：${assigningRole?.name || ""}`} open={assignOpen} onCancel={() => setAssignOpen(false)} onOk={submitAssign} destroyOnClose>
        <Form layout="vertical">
          <Form.Item label="菜单权限">
            <Select mode="multiple" value={selectedMenuIds} onChange={setSelectedMenuIds} options={menus.map((m) => ({ value: m.id, label: m.name }))} />
          </Form.Item>
          <Form.Item label="按钮权限">
            <Select mode="multiple" value={selectedPermissionIds} onChange={setSelectedPermissionIds} options={permissions.map((p) => ({ value: p.id, label: `${p.name} (${p.resource}:${p.action})` }))} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
