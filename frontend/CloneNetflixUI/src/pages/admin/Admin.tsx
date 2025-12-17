// src/pages/admin/Users.tsx
import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/Admin";
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
  id: string;
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
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
            size={48}
            className="ring-4 ring-indigo-500/20"
          />
          <div>
            <div className="font-semibold text-white">{record.displayName}</div>
            <div className="text-sm text-gray-400">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Роль",
      dataIndex: "role",
      render: (role) => (
        <Tag
          color={role === "Admin" ? "volcano" : "purple"}
          className="font-medium"
        >
          {role || "User"}
        </Tag>
      ),
    },
    {
      title: "Підписка",
      dataIndex: "subscriptionName",
      render: (name) =>
        name ? (
          <Tag color="cyan" className="font-medium">
            {name}
          </Tag>
        ) : (
          <Tag color="default">Немає</Tag>
        ),
    },
    {
      title: "Дії",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Редагувати
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            className="text-red-400 hover:text-red-300"
          >
            Видалити
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок + кнопка */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Управління користувачами
          </h1>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-xl font-bold text-lg px-8 py-6 h-auto"
          >
            Створити користувача
          </Button>
        </div>

        {/* Таблиця */}
        <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 15,
              position: ["bottomCenter"],
              className: "text-gray-400",
            }}
            scroll={{ x: 800 }}
            className="custom-ant-table"
            rowClassName="hover:bg-purple-900/20 transition-colors duration-200"  // ← ВИПРАВЛЕНО: м'який фіолетовий ховер
          />
        </div>

        {/* Модалка — без змін */}
        <Modal
          title={
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {editingUser ? "Редагувати користувача" : "Створити користувача"}
            </span>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          destroyOnClose
          centered
          className="custom-admin-modal"
        >
          {/* ... форма без змін ... */}
        </Modal>
      </div>

      {/* Стилі Ant Design — оновлено ховер для рядків */}
      <style jsx global>{`
        .custom-ant-table .ant-table {
          background: transparent;
          color: #e5e7eb;
        }
        .custom-ant-table .ant-table-thead > tr > th {
          background: #1f2937 !important;
          color: #9ca3af;
          border-bottom: 1px solid #374151;
        }
        .custom-ant-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #374151;
        }
        .custom-ant-table .ant-table-tbody > tr:hover > td {
          background: rgba(139, 92, 246, 0.15) !important; /* Додатковий ховер через CSS для надійності */
        }
        .custom-ant-table .ant-pagination-item {
          background: #1f2937;
          border-color: #374151;
        }
        .custom-ant-table .ant-pagination-item a {
          color: #e5e7eb;
        }
        .custom-ant-table .ant-pagination-item-active {
          background: #6366f1;
          border-color: #6366f1;
        }
        .custom-admin-modal .ant-modal-content {
          background: #111827;
          border: 1px solid #374151;
          border-radius: 24px;
        }
        .custom-admin-modal .ant-modal-header {
          background: transparent;
          border-bottom: 1px solid #374151;
          padding: 24px 32px;
        }
        .custom-admin-modal .ant-modal-body {
          padding: 32px;
        }
        .custom-admin-modal .ant-modal-close-x {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;