import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = { name: "", menuKey: "", path: "", parentId: null, sortOrder: 0 };

export default function MenusPage({ hasPermission }) {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchMenus = async () => {
    const response = await client.get("/menus");
    setData(response.data ?? []);
  };

  useEffect(() => { fetchMenus(); }, []);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) await client.post(`/menus/${editing.id}`, values);
    else await client.post("/menus", values);
    message.success(editing ? "菜单已更新" : "菜单已创建");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    fetchMenus();
  };

  const remove = async (id) => {
    await client.delete(`/menus/${id}`);
    message.success("菜单已删除");
    fetchMenus();
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {hasPermission("menus:create") && <Button type="primary" onClick={() => { setEditing(null); form.setFieldsValue(defaultForm); setOpen(true); }}>新增菜单</Button>}
      </Space>
      <Table
        rowKey="id"
        dataSource={data}
        pagination={false}
        columns={[
          { title: "ID", dataIndex: "id" },
          { title: "菜单Key", dataIndex: "menuKey" },
          { title: "名称", dataIndex: "name" },
          { title: "路由", dataIndex: "path" },
          { title: "父菜单ID", dataIndex: "parentId" },
          { title: "排序", dataIndex: "sortOrder" },
          {
            title: "操作",
            render: (_, record) => (
              <Space>
                {hasPermission("menus:update") && <Button type="link" onClick={() => { setEditing(record); setOpen(true); form.setFieldsValue(record); }}>编辑</Button>}
                {hasPermission("menus:delete") && <Popconfirm title="确认删除?" onConfirm={() => remove(record.id)}><Button type="link" danger>删除</Button></Popconfirm>}
              </Space>
            )
          }
        ]}
      />
      <Modal title={editing ? "编辑菜单" : "新增菜单"} open={open} onCancel={() => setOpen(false)} onOk={submit} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item name="name" label="菜单名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="menuKey" label="菜单Key" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="path" label="路由"><Input /></Form.Item>
          <Form.Item name="parentId" label="父菜单ID"><InputNumber style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber style={{ width: "100%" }} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
