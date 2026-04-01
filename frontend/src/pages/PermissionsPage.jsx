import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = { code: "", name: "", description: "", menuId: null, resource: "users", action: "view" };

export default function PermissionsPage({ hasPermission }) {
  const [data, setData] = useState([]);
  const [menus, setMenus] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchPermissions = async () => setData((await client.get("/permissions")).data ?? []);
  const fetchMenus = async () => setMenus((await client.get("/menus")).data ?? []);

  useEffect(() => { fetchPermissions(); fetchMenus(); }, []);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) await client.post(`/permissions/${editing.id}`, values);
    else await client.post("/permissions", values);
    message.success(editing ? "按钮权限已更新" : "按钮权限已创建");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    fetchPermissions();
  };

  const remove = async (id) => {
    await client.delete(`/permissions/${id}`);
    message.success("按钮权限已删除");
    fetchPermissions();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {hasPermission("permissions:create") && <Button type="primary" onClick={() => { setEditing(null); form.setFieldsValue(defaultForm); setOpen(true); }}>新增按钮权限</Button>}
      </Space>
      <Table rowKey="id" columns={[
        { title: "ID", dataIndex: "id" },
        { title: "权限编码", dataIndex: "code" },
        { title: "名称", dataIndex: "name" },
        { title: "菜单", dataIndex: "menuId", render: (id) => menus.find((m) => m.id === id)?.name || "-" },
        { title: "资源", dataIndex: "resource" },
        { title: "动作", dataIndex: "action", render: (v) => <Tag>{v}</Tag> },
        { title: "描述", dataIndex: "description" },
        {
          title: "操作",
          render: (_, record) => (
            <Space>
              {hasPermission("permissions:update") && <Button type="link" onClick={() => { setEditing(record); setOpen(true); form.setFieldsValue(record); }}>编辑</Button>}
              {hasPermission("permissions:delete") && <Popconfirm title="确认删除?" onConfirm={() => remove(record.id)}><Button type="link" danger>删除</Button></Popconfirm>}
            </Space>
          )
        }
      ]} dataSource={data} pagination={false} />
      <Modal title={editing ? "编辑按钮权限" : "新增按钮权限"} open={open} onCancel={() => setOpen(false)} onOk={submit} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item label="权限编码" name="code" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="所属菜单" name="menuId" rules={[{ required: true }]}><Select options={menus.map((m) => ({ value: m.id, label: m.name }))} /></Form.Item>
          <Form.Item label="资源(resource)" name="resource" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="动作(action)" name="action" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="描述" name="description"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
