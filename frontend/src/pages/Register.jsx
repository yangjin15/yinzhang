import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { authAPI } from "../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

const Register = ({ onSuccess, onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 部门选项
  const departments = [
    "行政部",
    "财务部",
    "人事部",
    "销售部",
    "市场部",
    "技术部",
    "法务部",
    "运营部",
    "客服部",
    "采购部",
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.register(values);
      message.success("注册成功！请使用您的账号登录。");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "注册失败，请重试";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("请输入密码"));
    }
    if (value.length < 6) {
      return Promise.reject(new Error("密码长度不能少于6位"));
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value)) {
      return Promise.reject(new Error("密码必须包含字母和数字"));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("请确认密码"));
    }
    if (value !== form.getFieldValue("password")) {
      return Promise.reject(new Error("两次输入的密码不一致"));
    }
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card
          className="shadow-2xl border-0"
          style={{
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserOutlined className="text-3xl text-white" />
            </div>
            <Title level={2} className="mb-2" style={{ color: "#1f2937" }}>
              创建新账户
            </Title>
            <Text type="secondary" className="text-lg">
              加入印章管理系统，开始高效办公
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[
                    { required: true, message: "请输入用户名" },
                    { min: 3, message: "用户名至少3个字符" },
                    { max: 20, message: "用户名不能超过20个字符" },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: "用户名只能包含字母、数字和下划线",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="请输入用户名"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="realName"
                  label="真实姓名"
                  rules={[
                    { required: true, message: "请输入真实姓名" },
                    { max: 20, message: "姓名不能超过20个字符" },
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    placeholder="请输入真实姓名"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ validator: validatePassword }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="请输入密码"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  rules={[{ validator: validateConfirmPassword }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="请再次输入密码"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="请输入邮箱地址"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[
                    {
                      pattern: /^1[3-9]\d{9}$/,
                      message: "请输入有效的手机号码",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="请输入手机号码"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="department"
                  label="部门"
                  rules={[{ required: true, message: "请选择部门" }]}
                >
                  <Select
                    placeholder="请选择部门"
                    className="rounded-lg"
                    suffixIcon={<TeamOutlined className="text-gray-400" />}
                  >
                    {departments.map((dept) => (
                      <Option key={dept} value={dept}>
                        {dept}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="position" label="职位">
                  <Input placeholder="请输入职位" className="rounded-lg" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-lg font-semibold rounded-lg shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                {loading ? "注册中..." : "立即注册"}
              </Button>
            </Form.Item>

            <div className="text-center">
              <Space>
                <Text type="secondary">已有账户？</Text>
                <Button
                  type="link"
                  className="text-blue-600 hover:text-blue-800 font-medium p-0"
                  onClick={onSwitchToLogin}
                >
                  立即登录
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        <div className="text-center mt-8">
          <Text type="secondary" className="text-sm">
            © 2024 印章管理系统. 保留所有权利.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Register;
