// src/pages/admin/Users.tsx
import React, { useEffect, useState } from "react";
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
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { adminApi } from "../../api/Admin";
import { useLanguage } from "../../contexts/LanguageContext";

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
  const { t } = useLanguage();
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
      message.error(t("admin.users.load_error"));
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
      message.success(t("admin.users.deleted"));
      fetchUsers();
    } catch (err: any) {
      message.error(t("admin.users.delete_error"));
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
        // Оновлення (без пароля)
        await adminApi.updateUser(editingUser.id, {
          email: values.email.trim(),
          displayName: values.displayName.trim(),
          profilePictureUrl: values.profilePictureUrl || null,
        });
        message.success(t("admin.users.updated"));
      } else {
        // Створення нового
        if (!values.password) {
          message.error(t("admin.users.password_required"));
          return;
        }
        await adminApi.createUser({
          email: values.email.trim(),
          displayName: values.displayName.trim(),
          password: values.password,
          profilePictureUrl: values.profilePictureUrl || null,
        });
        message.success(t("admin.users.created"));
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (editingUser ? t("admin.users.update_error") : t("admin.users.create_error"));
      message.error(msg);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: t("admin.users.user"),
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
            <div className="font-semibold text-white">{record.displayName || t("common.unknown")}</div>
            <div className="text-sm text-gray-400">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: t("admin.users.role"),
      dataIndex: "role",
      render: (role) => (
        <Tag
          color={role === "Admin" ? "volcano" : role === "Moderator" ? "geekblue" : "purple"}
          className="font-medium"
        >
          {role || t("admin.users.user")}
        </Tag>
      ),
    },
    {
      title: t("admin.users.subscription"),
      dataIndex: "subscriptionName",
      render: (name) =>
        name ? (
          <Tag color="cyan" className="font-medium">
            {name}
          </Tag>
        ) : (
          <Tag color="default">{t("admin.users.no_subscription")}</Tag>
        ),
    },
    {
      title: t("admin.users.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            {t("common.edit")}
          </Button>

          <Popconfirm
            title={t("admin.users.confirm_delete")}
            description={t("admin.users.confirm_delete_desc")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.yes")}
            cancelText={t("common.no")}
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              className="text-red-400 hover:text-red-300"
            >
              {t("common.delete")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок + кнопка */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t("admin.users.title")}
          </h1>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-xl font-bold text-lg px-8 py-6 h-auto"
          >
            {t("admin.users.create_user")}
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
            rowClassName="hover:bg-purple-900/20 transition-colors duration-200"
          />
        </div>

        {/* Модальне вікно створення/редагування */}
        <Modal
          title={
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {editingUser ? t("admin.users.edit_user") : t("admin.users.create_user")}
            </span>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          destroyOnClose
          centered
          width={600}
          className="custom-admin-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-6"
          >
            <Form.Item
              name="email"
              label={t("admin.users.email")}
              rules={[
                { required: true, message: t("admin.users.email_required") },
                { type: "email", message: t("admin.users.email_invalid") },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="example@email.com"
                size="large"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="displayName"
              label={t("admin.users.display_name")}
              rules={[{ required: true, message: t("admin.users.name_required") }]}
            >
              <Input size="large" className="rounded-xl" />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="password"
                label={t("admin.users.password")}
                rules={[
                  { required: true, message: t("admin.users.password_required") },
                  { min: 6, message: t("admin.users.password_min") },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  size="large"
                  className="rounded-xl"
                />
              </Form.Item>
            )}

            <Form.Item name="profilePictureUrl" label={t("admin.users.avatar_url")}>
              <Input placeholder="https://..." size="large" className="rounded-xl" />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={() => setModalOpen(false)} size="large">
                  {t("common.cancel")}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  {editingUser ? t("common.save") : t("admin.users.create")}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>

      {/* Глобальні стилі */}
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
          background: rgba(139, 92, 246, 0.15) !important;
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
          a {
            color: white !important;
          }
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
          padding: 0 32px 32px;
        }
        .custom-admin-modal .ant-modal-close-x {
          color: #9ca3af;
        }
        .ant-form-item-label > label {
          color: #d1d5db !important;
        }
        .ant-input,
        .ant-input-password {
          background: #1f2937;
          border-color: #374151;
          color: white;
        }
        .ant-input::placeholder {
          color: #6b7280;
        }
        .ant-input-affix-wrapper {
          background: #1f2937;
          border-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;