import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  // 侧边栏菜单项
  const menuItems = [
    {
      key: "1",
      icon: <SafetyOutlined className="text-lg" />,
      label: "印章管理",
      children: [
        {
          key: "1-1",
          label: "印章列表",
        },
        {
          key: "1-2",
          label: "添加印章",
        },
      ],
    },
    {
      key: "2",
      icon: <FileTextOutlined className="text-lg" />,
      label: "用印申请",
      children: [
        {
          key: "2-1",
          label: "我的申请",
        },
        {
          key: "2-2",
          label: "待审批",
        },
        {
          key: "2-3",
          label: "已完成",
        },
      ],
    },
    {
      key: "3",
      icon: <BarChartOutlined className="text-lg" />,
      label: "统计分析",
      children: [
        {
          key: "3-1",
          label: "使用统计",
        },
        {
          key: "3-2",
          label: "报表中心",
        },
      ],
    },
    {
      key: "4",
      icon: <UserOutlined className="text-lg" />,
      label: "用户管理",
      children: [
        {
          key: "4-1",
          label: "用户列表",
        },
        {
          key: "4-2",
          label: "角色管理",
        },
      ],
    },
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人资料",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "系统设置",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        className="bg-white shadow-apple-lg relative z-10"
      >
        {/* Logo区域 */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <SafetyOutlined className="text-white text-lg" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900">
                  印章管理
                </span>
                <span className="text-xs text-gray-500">Seal Management</span>
              </div>
            )}
          </div>
        </div>

        {/* 菜单区域 */}
        <div className="py-4">
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={["1-1"]}
            defaultOpenKeys={["1"]}
            items={menuItems}
            className="border-none"
          />
        </div>
      </Sider>

      {/* 主要内容区域 */}
      <Layout className="ml-0">
        {/* 顶部导航栏 */}
        <Header className="bg-white shadow-apple px-6 flex items-center justify-between border-b border-gray-100 h-16">
          <div className="flex items-center space-x-4">
            {/* 折叠按钮 */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg"
            />

            {/* 面包屑导航 */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">印章管理</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">印章列表</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 搜索按钮 */}
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg"
            />

            {/* 通知按钮 */}
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg"
              />
            </Badge>

            {/* 用户信息 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
                <Avatar
                  size={32}
                  src="https://joeschmoe.io/api/v1/random"
                  className="border-2 border-white shadow-sm"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    张三
                  </span>
                  <span className="text-xs text-gray-500">管理员</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content className="p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
