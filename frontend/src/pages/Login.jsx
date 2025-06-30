import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  message,
  Divider,
  Space,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { authAPI } from "../services/api";

const { Title, Text } = Typography;

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.username, values.password);
      console.log("Login response:", response);
      if (response.code === 200) {
        message.success("登录成功！");
        console.log("Calling onLogin with data:", response.data);
        // 调用父组件的登录回调
        if (onLogin) {
          onLogin(response.data);
        }
      } else {
        console.log("Login failed - response code:", response.code, response);
        message.error(response.message || "登录失败");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "登录失败，请检查用户名和密码";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-apple-lg mb-4">
            <SafetyOutlined className="text-white text-2xl" />
          </div>
          <Title level={2} className="text-gray-900 mb-2">
            印章管理系统
          </Title>
          <Text className="text-gray-600">
            安全、高效的企业印章管理解决方案
          </Text>
        </div>

        {/* 登录卡片 */}
        <Card className="shadow-apple-lg border-0 backdrop-blur-sm bg-white/80">
          <div className="p-2">
            <Title level={3} className="text-center text-gray-900 mb-6">
              登录账户
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="用户名"
                  className="input-apple h-12"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="密码"
                  className="input-apple h-12"
                  iconRender={(visible) =>
                    visible ? (
                      <EyeTwoTone className="text-gray-400" />
                    ) : (
                      <EyeInvisibleOutlined className="text-gray-400" />
                    )
                  }
                />
              </Form.Item>

              <Form.Item>
                <div className="flex items-center justify-between">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-gray-600">记住我</Checkbox>
                  </Form.Item>
                  <Button type="link" className="text-blue-600 p-0 h-auto">
                    忘记密码？
                  </Button>
                </div>
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 button-primary text-lg font-medium"
                >
                  {loading ? "登录中..." : "登录"}
                </Button>
              </Form.Item>
            </Form>

            {/* 注册链接 */}
            <div className="text-center mb-4">
              <Space>
                <Text className="text-gray-600">还没有账户？</Text>
                <Button
                  type="link"
                  className="text-blue-600 p-0 h-auto font-medium"
                  onClick={onSwitchToRegister}
                >
                  立即注册
                </Button>
              </Space>
            </div>

            <Divider className="text-gray-400">演示账户</Divider>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">管理员账户</span>
                  <Button
                    type="link"
                    size="small"
                    className="text-blue-600 p-0 h-auto"
                    onClick={() => {
                      form.setFieldsValue({
                        username: "admin",
                        password: "admin123",
                      });
                    }}
                  >
                    快速填入
                  </Button>
                </div>
                <div className="text-gray-600">
                  用户名: admin / 密码: admin123
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 底部信息 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <div className="mb-2">© 2024 印章管理系统. All rights reserved.</div>
          <div className="flex items-center justify-center space-x-4">
            <Button type="link" size="small" className="text-gray-500 p-0">
              使用条款
            </Button>
            <span className="text-gray-300">|</span>
            <Button type="link" size="small" className="text-gray-500 p-0">
              隐私政策
            </Button>
            <span className="text-gray-300">|</span>
            <Button type="link" size="small" className="text-gray-500 p-0">
              技术支持
            </Button>
          </div>
        </div>

        {/* 装饰性元素 */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-4 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default Login;
