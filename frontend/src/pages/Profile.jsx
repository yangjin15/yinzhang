import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Divider,
  Row,
  Col,
  Space,
  Tag,
  Modal,
  Spin,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  SafetyOutlined,
  LockOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { userAPI, authAPI } from "../services/api";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 用户数据状态
  const [userInfo, setUserInfo] = useState(null);

  const roleTypeMap = {
    ADMIN: { text: "管理员", color: "red" },
    MANAGER: { text: "经理", color: "blue" },
    USER: { text: "普通用户", color: "green" },
  };

  // 获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setDataLoading(true);
      const currentUser = authAPI.getCurrentUser();
      if (currentUser && currentUser.id) {
        const response = await userAPI.getUserById(currentUser.id);
        if (response && response.success) {
          setUserInfo(response.data);
        } else {
          message.error(response?.message || "获取用户信息失败");
        }
      } else {
        message.error("用户未登录，请重新登录");
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
      message.error("获取用户信息失败：" + (error.message || "未知错误"));
    } finally {
      setDataLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue(userInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await userAPI.updateUser(userInfo.id, values);
      if (response && response.success) {
        setUserInfo({ ...userInfo, ...values });
        setIsEditing(false);
        message.success("个人信息更新成功");
        // 更新localStorage中的用户信息
        const updatedUser = { ...userInfo, ...values };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        message.error(response?.message || "更新失败");
      }
    } catch (error) {
      console.error("更新用户信息失败:", error);
      message.error("更新失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      const response = await userAPI.changePassword(
        userInfo.id,
        values.oldPassword,
        values.newPassword
      );
      if (response && response.success) {
        message.success("密码修改成功");
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(response?.message || "密码修改失败");
      }
    } catch (error) {
      console.error("修改密码失败:", error);
      message.error("密码修改失败：" + (error.message || "未知错误"));
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      message.success("头像上传成功");
      // 这里可以更新头像URL
    } else if (info.file.status === "error") {
      message.error("头像上传失败");
    }
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center">
      <CameraOutlined className="text-gray-400 text-xl mb-2" />
      <div className="text-sm text-gray-500">点击上传</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {dataLoading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" tip="加载用户信息中..." />
        </div>
      ) : !userInfo ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <UserOutlined className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl text-gray-600">无法获取用户信息</h3>
            <p className="text-gray-500 mt-2">请刷新页面重试</p>
            <Button type="primary" onClick={fetchUserInfo} className="mt-4">
              重新加载
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 个人信息卡片 */}
          <Card className="shadow-apple-lg">
            <div className="flex flex-col lg:flex-row">
              {/* 左侧：头像和基本信息 */}
              <div className="lg:w-1/3 flex flex-col items-center space-y-4 p-6 border-r border-gray-100">
                <div className="relative">
                  <Avatar
                    size={120}
                    src={userInfo?.avatar}
                    className="border-4 border-white shadow-apple"
                  >
                    {userInfo?.realName?.charAt(0)}
                  </Avatar>
                  <Upload
                    name="avatar"
                    listType="picture"
                    className="avatar-uploader absolute bottom-0 right-0"
                    showUploadList={false}
                    onChange={handleAvatarChange}
                  >
                    <Button
                      shape="circle"
                      icon={<CameraOutlined className="text-gray-600" />}
                      className="shadow-apple border-2 border-white"
                    />
                  </Upload>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {userInfo?.realName}
                  </h2>
                  <p className="text-gray-600">@{userInfo?.username}</p>
                  <Tag
                    color={roleTypeMap[userInfo?.role]?.color}
                    className="mb-2"
                  >
                    {roleTypeMap[userInfo?.role]?.text}
                  </Tag>
                  <p className="text-sm text-gray-500">
                    {userInfo?.bio || "暂无个人简介"}
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <TeamOutlined />
                    <span>
                      {userInfo?.department || "未设置"} -{" "}
                      {userInfo?.position || "未设置"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MailOutlined />
                    <span>{userInfo?.email || "未设置"}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <PhoneOutlined />
                    <span>{userInfo?.phone || "未设置"}</span>
                  </div>
                </div>

                <Divider />

                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">创建时间:</span>
                    <span className="font-medium">
                      {userInfo?.createTime
                        ? new Date(userInfo.createTime).toLocaleDateString()
                        : "未知"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">最后登录:</span>
                    <span className="font-medium">
                      {userInfo?.lastLogin
                        ? new Date(userInfo.lastLogin).toLocaleString()
                        : "未知"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">登录次数:</span>
                    <span className="font-medium">
                      {userInfo?.loginCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右侧：详细信息表单 */}
              <div className="lg:w-2/3 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    个人信息
                  </h3>
                  <Space>
                    <Button
                      icon={<LockOutlined className="text-gray-600" />}
                      onClick={() => setIsPasswordModalVisible(true)}
                    >
                      修改密码
                    </Button>
                    {!isEditing ? (
                      <Button
                        type="primary"
                        icon={<EditOutlined className="text-white" />}
                        onClick={handleEdit}
                        className="button-primary"
                      >
                        编辑信息
                      </Button>
                    ) : (
                      <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button
                          type="primary"
                          icon={<CheckOutlined className="text-white" />}
                          onClick={() => form.submit()}
                          loading={loading}
                          className="button-primary"
                        >
                          保存
                        </Button>
                      </Space>
                    )}
                  </Space>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  disabled={!isEditing}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="realName"
                        label="真实姓名"
                        rules={[{ required: true, message: "请输入真实姓名" }]}
                      >
                        <Input
                          placeholder="请输入真实姓名"
                          className="input-apple"
                          prefix={<UserOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="username" label="用户名">
                        <Input
                          placeholder="用户名"
                          className="input-apple"
                          disabled
                          prefix={<UserOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: "请输入邮箱" },
                          { type: "email", message: "请输入正确的邮箱格式" },
                        ]}
                      >
                        <Input
                          placeholder="请输入邮箱"
                          className="input-apple"
                          prefix={<MailOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[
                          { required: true, message: "请输入手机号" },
                          {
                            pattern: /^1[3-9]\d{9}$/,
                            message: "请输入正确的手机号码",
                          },
                        ]}
                      >
                        <Input
                          placeholder="请输入手机号"
                          className="input-apple"
                          prefix={<PhoneOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="department"
                        label="部门"
                        rules={[{ required: true, message: "请输入部门" }]}
                      >
                        <Input
                          placeholder="请输入部门"
                          className="input-apple"
                          prefix={<TeamOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="position"
                        label="职位"
                        rules={[{ required: true, message: "请输入职位" }]}
                      >
                        <Input
                          placeholder="请输入职位"
                          className="input-apple"
                          prefix={<SafetyOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="bio" label="个人简介">
                    <Input.TextArea
                      rows={4}
                      placeholder="请输入个人简介"
                      className="input-apple"
                    />
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Card>

          {/* 修改密码模态框 */}
          <Modal
            title="修改密码"
            open={isPasswordModalVisible}
            onCancel={() => {
              setIsPasswordModalVisible(false);
              passwordForm.resetFields();
            }}
            footer={null}
            width={500}
            className="rounded-lg"
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
              className="mt-4"
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: "请输入当前密码" }]}
              >
                <Input.Password
                  placeholder="请输入当前密码"
                  className="input-apple"
                  prefix={<LockOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: "请输入新密码" },
                  { min: 6, message: "密码长度至少6位" },
                ]}
              >
                <Input.Password
                  placeholder="请输入新密码"
                  className="input-apple"
                  prefix={<LockOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "请确认密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="请确认新密码"
                  className="input-apple"
                  prefix={<LockOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => {
                      setIsPasswordModalVisible(false);
                      passwordForm.resetFields();
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="button-primary"
                  >
                    确认修改
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Profile;
