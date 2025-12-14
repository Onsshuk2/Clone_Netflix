// src/pages/admin/Users.tsx
import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/Admin"; // ← перевір шлях!
import {
  Button,
  Table,
  message,
  Modal,
  Form,
  Input,
  Avatar,
  Space,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface User {
  id: string; // ← у тебе id — string (GUID), не number!
  email: string;
  displayName: string;
  profilePictureUrl?: string | null;
  subscriptionId?: string | null;
  subscriptionName?: string | null;
  role?: string;
  createdAt?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // КЛЮЧОВА ЗМІНА: adminApi.getAllUsers() вже повертає масив!
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers(); // ← ОТРИМУЄМО МАСИВ
      setUsers(data); // ← не .data, не res.data → просто data
    } catch (err: any) {
      message.error("Не вдалося завантажити користувачів");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteUser(id);
      message.success("Користувача видалено");
      fetchUsers();
    } catch {
      message.error("Помилка видалення");
    }
  };

  const openModal = (user?: User) => {
    setEditingUser(user || null);
    if (user) {
      form.setFieldsValue({
        email: user.email,
        displayName: user.displayName,
        profilePictureUrl: user.profilePictureUrl || "",
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, {
          email: values.email,
          displayName: values.displayName,
          profilePictureUrl: values.profilePictureUrl || null,
        });
        message.success("Оновлено");
      } else {
        await adminApi.createUser({
          email: values.email.trim(),
          displayName: values.displayName.trim(),
          password: values.password,
          profilePictureUrl: values.profilePictureUrl || null,
        });
        message.success("Користувача створено!");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Перевірте введені дані");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Користувач",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.profilePictureUrl || undefined}
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.displayName}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Роль",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === "Admin" ? "red" : "blue"}>{role || "User"}</Tag>
      ),
    },
    {
      title: "Підписка",
      dataIndex: "subscriptionName",
      render: (name) =>
        name ? <Tag color="green">{name}</Tag> : <Tag>Немає</Tag>,
    },
    {
      title: "Дії",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Редагувати
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Видалити
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Управління користувачами</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Створити користувача
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={editingUser ? "Редагувати користувача" : "Створити користувача"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden // ← виправлено з destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="displayName"
            label="Ім'я"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="profilePictureUrl"
            label="URL аватарки (необов'язково)"
          >
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setModalOpen(false)}
            >
              Скасувати
            </Button>
            <Button type="primary" htmlType="submit">
              {editingUser ? "Зберегти" : "Створити"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
