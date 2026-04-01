import { Button, Form, Input, Modal, Select, Space, Table, message } from "antd";
import { useEffect, useState } from "react";
import client from "../api/client.js";

const defaultForm = {
  code: "",
  name: "",
  description: ""
};

export default function RolesPage({ hasPermission }) {
  const [data, setData] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningRole, setAssigningRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    const response = await client.get("/roles");
    setData(response.data);
  };

  const fetchPermissions = async () => {
    const response = await client.get("/permissions");
    setPermissions(response.data);
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await client.post("/roles", values);
    message.success("角色已创建");
    setOpen(false);
    form.resetFields();
    fetchRoles();
  };

  const openAssignPermissions = async (record) => {
    const response = await client.get(`/roles/${record.id}/permissions`);
    setAssigningRole(record);
    setSelectedPermissionIds(response.data ?? []);
    setAssignOpen(true);
  };

  const submitAssignPermissions = async () => {
    await client.post("/roles/assign-permissions", {
      roleId: assigningRole.id,
      permissionIds: selectedPermissionIds
    });
    message.success("角色权限已更新");
    setAssignOpen(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "编码", dataIndex: "code" },
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    {
      title: "操作",
      key: "actions",
      render: (_, record) => (
        hasPermission("roles:assign") ? (
          <Button type="link" onClick={() => openAssignPermissions(record)}>
            分配菜单/按钮权限
          </Button>
        ) : "-"
      )
    }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {hasPermission("roles:create") && (
          <Button type="primary" onClick={() => setOpen(true)}>
            新增角色
          </Button>
        )}
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

      <Modal
        title={`为角色分配权限：${assigningRole?.name || ""}`}
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        onOk={submitAssignPermissions}
        destroyOnClose
      >
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="选择菜单/按钮权限"
          value={selectedPermissionIds}
          onChange={setSelectedPermissionIds}
          options={permissions.map((permission) => ({
            value: permission.id,
            label: `${permission.name} (${permission.resource}:${permission.action})`
          }))}
        />
      </Modal>
    </>
  );
}
