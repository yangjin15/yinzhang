import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Tabs,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
  Switch,
  Popconfirm,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { userAPI } from "../services/api";
import { authAPI } from "../services/api";

const { Option } = Select;
const { Search } = Input;

const UserManagement = ({ currentTab = "users" }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeTab, setActiveTab] = useState(currentTab);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalRoles: 0,
  });
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [viewingRecord, setViewingRecord] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);

  // 用户状态映射
  const userStatusMap = {
    ACTIVE: { text: "正常", color: "success" },
    INACTIVE: { text: "禁用", color: "error" },
    PENDING: { text: "待激活", color: "warning" },
  };

  // 角色类型映射
  const roleTypeMap = {
    ADMIN: { text: "管理员", color: "red", icon: <CrownOutlined /> },
    MANAGER: { text: "经理", color: "blue", icon: <TeamOutlined /> },
    USER: { text: "普通用户", color: "green", icon: <UserOutlined /> },
  };

  // 获取数据
  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [currentPage, pageSize, searchKeyword, statusFilter, roleFilter]);

  // 监听currentTab参数变化，更新activeTab
  useEffect(() => {
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
      setCurrentPage(1); // 重置页码
    }
  }, [currentTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      };

      const response = await userAPI.getUsers(params);
      if (response.success) {
        setUsers(response.data.list);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error("获取用户列表失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await userAPI.getUserStatistics();
      if (response.success) {
        const stats = response.data;
        setStatistics({
          totalUsers: stats.totalUsers || 0,
          activeUsers: stats.byStatus?.ACTIVE || 0,
          inactiveUsers: stats.byStatus?.INACTIVE || 0,
          totalRoles: 3, // 固定的角色数量
        });
      }
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  };

  // 初始化角色数据
  useEffect(() => {
    if (activeTab === "roles") {
      // 模拟角色数据
      const mockRoles = [
        {
          id: 1,
          roleName: "管理员",
          roleCode: "ADMIN",
          description: "系统管理员，拥有所有权限",
          userCount: users.filter((user) => user.role === "ADMIN").length,
          status: "ACTIVE",
        },
        {
          id: 2,
          roleName: "经理",
          roleCode: "MANAGER",
          description: "部门经理，拥有部分管理权限",
          userCount: users.filter((user) => user.role === "MANAGER").length,
          status: "ACTIVE",
        },
        {
          id: 3,
          roleName: "普通用户",
          roleCode: "USER",
          description: "普通用户，只能使用基本功能",
          userCount: users.filter((user) => user.role === "USER").length,
          status: "ACTIVE",
        },
      ];
      setRoles(mockRoles);
    }
  }, [activeTab, users]);

  // 搜索处理
  const handleSearch = (value) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  // 筛选处理
  const handleFilterChange = (type, value) => {
    if (type === "status") {
      setStatusFilter(value);
    } else if (type === "role") {
      setRoleFilter(value);
    }
    setCurrentPage(1);
  };

  // 页码变化处理
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // 查看用户详情
  const handleViewUser = (record) => {
    console.log("查看详情 - 记录数据:", record);

    try {
      setViewingRecord(record);
      setIsViewModalVisible(true);
    } catch (error) {
      console.error("显示详情时出错:", error);
      message.error("无法显示详情，请重试");
    }
  };

  // 编辑用户
  const handleEditUser = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 编辑角色
  const handleEditRole = (record) => {
    setEditingRole(record);
    roleForm.setFieldsValue(record);
    setIsRoleModalVisible(true);
  };

  // 切换用户状态
  const handleToggleUserStatus = async (record) => {
    try {
      const newStatus = record.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await userAPI.updateUserStatus(record.id, newStatus);
      if (response.success) {
        message.success("用户状态更新成功");
        fetchUsers();
      }
    } catch (error) {
      message.error("更新用户状态失败：" + (error.message || "未知错误"));
    }
  };

  // 删除用户
  const handleDeleteUser = async (id) => {
    try {
      // 检查当前用户权限
      const currentUser = authAPI.getCurrentUser();
      if (!currentUser) {
        message.error("用户未登录");
        return;
      }

      if (currentUser.role !== "ADMIN") {
        message.error("权限不足，只有管理员可以删除用户");
        return;
      }

      const response = await userAPI.deleteUser(id, currentUser.username);
      if (response.success) {
        message.success("用户删除成功");
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      message.error("删除用户失败：" + (error.message || "未知错误"));
    }
  };

  // 删除角色
  const handleDeleteRole = (id) => {
    message.info("角色删除功能开发中...");
  };

  // 添加用户
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 添加角色
  const handleAddRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setIsRoleModalVisible(true);
  };

  // 提交用户表单
  const handleSubmitUser = async (values) => {
    try {
      let response;
      if (editingUser) {
        response = await userAPI.updateUser(editingUser.id, values);
      } else {
        response = await userAPI.createUser(values);
      }

      if (response.success) {
        message.success(editingUser ? "用户更新成功" : "用户创建成功");
        setIsModalVisible(false);
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      message.error(
        (editingUser ? "更新" : "创建") +
          "用户失败：" +
          (error.message || "未知错误")
      );
    }
  };

  // 提交角色表单
  const handleSubmitRole = async (values) => {
    message.info("角色管理功能开发中...");
    setIsRoleModalVisible(false);
  };

  // 用户表格列定义
  const userColumns = [
    {
      title: "用户信息",
      key: "userInfo",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            size={40}
            className="bg-gradient-to-r from-blue-500 to-blue-600"
          >
            {record.realName.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{record.realName}</div>
            <div className="text-sm text-gray-500">@{record.username}</div>
            <div className="text-xs text-gray-400">{record.department}</div>
          </div>
        </div>
      ),
    },
    {
      title: "联系方式",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm">{record.email}</div>
          <div className="text-sm text-gray-600">{record.phone}</div>
        </div>
      ),
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => {
        const roleInfo = roleTypeMap[role];
        return (
          <Tag color={roleInfo?.color} icon={roleInfo?.icon}>
            {roleInfo?.text}
          </Tag>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={userStatusMap[status]?.color}>
          {userStatusMap[status]?.text}
        </Tag>
      ),
    },
    {
      title: "最后登录",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 140,
      render: (time) => (
        <div className="text-sm text-gray-600">
          {new Date(time).toLocaleString()}
        </div>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const currentUser = authAPI.getCurrentUser();
        return (
          <Space size="small">
            <Tooltip title="查看详情">
              <Button
                type="text"
                icon={<EyeOutlined className="text-gray-500" />}
                onClick={() => handleViewUser(record)}
                className="hover:bg-blue-50 hover:text-blue-600"
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined className="text-gray-500" />}
                onClick={() => handleEditUser(record)}
                className="hover:bg-green-50 hover:text-green-600"
              />
            </Tooltip>
            <Tooltip title={record.status === "ACTIVE" ? "禁用" : "启用"}>
              <Button
                type="text"
                icon={
                  record.status === "ACTIVE" ? (
                    <LockOutlined className="text-gray-500" />
                  ) : (
                    <UnlockOutlined className="text-gray-500" />
                  )
                }
                onClick={() => handleToggleUserStatus(record)}
                className="hover:bg-yellow-50 hover:text-yellow-600"
              />
            </Tooltip>
            {currentUser && currentUser.role === "ADMIN" && (
              <Tooltip title="删除">
                <Popconfirm
                  title="确定要删除这个用户吗？"
                  onConfirm={() => handleDeleteUser(record.id)}
                  okText="确定"
                  cancelText="取消"
                  okButtonProps={{
                    style: {
                      backgroundColor: "#ef4444",
                      borderColor: "#ef4444",
                    },
                  }}
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined className="text-gray-500" />}
                    className="hover:bg-red-50 hover:text-red-600"
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // 角色表格列定义
  const roleColumns = [
    {
      title: "角色信息",
      key: "roleInfo",
      width: 200,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CrownOutlined className="text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.roleName}</div>
            <div className="text-sm text-gray-500">{record.roleCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <div className="text-sm text-gray-600">{description}</div>
      ),
    },
    {
      title: "用户数量",
      dataIndex: "userCount",
      key: "userCount",
      width: 100,
      render: (count) => (
        <span className="font-semibold text-blue-600">{count}</span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "success" : "error"}>
          {status === "ACTIVE" ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined className="text-gray-500" />}
              onClick={() => handleEditRole(record)}
              className="hover:bg-green-50 hover:text-green-600"
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个角色吗？"
              onConfirm={() => handleDeleteRole(record.id)}
              okText="确定"
              cancelText="取消"
              okButtonProps={{
                style: { backgroundColor: "#ef4444", borderColor: "#ef4444" },
              }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined className="text-gray-500" />}
                className="hover:bg-red-50 hover:text-red-600"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="总用户数"
              value={statistics.totalUsers}
              valueStyle={{ color: "#3b82f6" }}
              prefix={<UserOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="活跃用户"
              value={statistics.activeUsers}
              valueStyle={{ color: "#10b981" }}
              prefix={<TeamOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="禁用用户"
              value={statistics.inactiveUsers}
              valueStyle={{ color: "#ef4444" }}
              prefix={<LockOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="角色数量"
              value={statistics.totalRoles}
              valueStyle={{ color: "#8b5cf6" }}
              prefix={<CrownOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card className="shadow-apple-lg">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "users",
              label: (
                <span>
                  <UserOutlined className="text-gray-600" />
                  用户列表
                </span>
              ),
              children: (
                <div className="space-y-4">
                  {/* 操作栏 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <Search
                        placeholder="搜索用户名或姓名"
                        allowClear
                        enterButton={<SearchOutlined className="text-white" />}
                        size="large"
                        className="sm:w-80"
                        onSearch={handleSearch}
                      />
                      <Select
                        placeholder="选择状态"
                        allowClear
                        size="large"
                        className="sm:w-32"
                        onChange={(value) =>
                          handleFilterChange("status", value)
                        }
                      >
                        {Object.entries(userStatusMap).map(([key, value]) => (
                          <Option key={key} value={key}>
                            {value.text}
                          </Option>
                        ))}
                      </Select>
                      <Select
                        placeholder="选择角色"
                        allowClear
                        size="large"
                        className="sm:w-32"
                        onChange={(value) => handleFilterChange("role", value)}
                      >
                        {Object.entries(roleTypeMap).map(([key, value]) => (
                          <Option key={key} value={key}>
                            {value.text}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined className="text-white" />}
                      onClick={handleAddUser}
                      className="button-primary"
                    >
                      添加用户
                    </Button>
                  </div>

                  {/* 用户表格 */}
                  <Table
                    columns={userColumns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                      onChange: handleTableChange,
                    }}
                    scroll={{ x: 1000 }}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              ),
            },
            {
              key: "roles",
              label: (
                <span>
                  <CrownOutlined className="text-gray-600" />
                  角色管理
                </span>
              ),
              children: (
                <div className="space-y-4">
                  {/* 操作栏 */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        角色列表
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        管理系统角色和权限
                      </p>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined className="text-white" />}
                      onClick={handleAddRole}
                      className="button-primary"
                    >
                      添加角色
                    </Button>
                  </div>

                  {/* 角色表格 */}
                  <Table
                    columns={roleColumns}
                    dataSource={roles}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? "编辑用户" : "添加用户"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitUser}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input placeholder="请输入用户名" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="realName"
                label="真实姓名"
                rules={[{ required: true, message: "请输入真实姓名" }]}
              >
                <Input placeholder="请输入真实姓名" className="input-apple" />
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
                <Input placeholder="请输入邮箱" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: "请输入手机号" },
                  { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码" },
                ]}
              >
                <Input placeholder="请输入手机号" className="input-apple" />
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
                <Input placeholder="请输入部门" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="职位"
                rules={[{ required: true, message: "请输入职位" }]}
              >
                <Input placeholder="请输入职位" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: "请输入密码" },
                    { min: 6, message: "密码长度不能少于6位" },
                  ]}
                >
                  <Input.Password
                    placeholder="请输入密码"
                    className="input-apple"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "请确认密码" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("两次输入的密码不一致")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="请确认密码"
                    className="input-apple"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: "请选择角色" }]}
              >
                <Select placeholder="请选择角色">
                  {Object.entries(roleTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: "请选择状态" }]}
              >
                <Select placeholder="请选择状态">
                  {Object.entries(userStatusMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="button-primary"
              >
                {editingUser ? "更新用户" : "创建用户"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加/编辑角色模态框 */}
      <Modal
        title={editingRole ? "编辑角色" : "添加角色"}
        open={isRoleModalVisible}
        onCancel={() => setIsRoleModalVisible(false)}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleSubmitRole}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="角色名称"
                rules={[{ required: true, message: "请输入角色名称" }]}
              >
                <Input placeholder="请输入角色名称" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roleCode"
                label="角色代码"
                rules={[{ required: true, message: "请输入角色代码" }]}
              >
                <Input placeholder="请输入角色代码" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: "请输入角色描述" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入角色描述"
              className="input-apple"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsRoleModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="button-primary"
              >
                {editingRole ? "更新角色" : "创建角色"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看用户详情模态框 */}
      <Modal
        title="用户详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        {viewingRecord ? (
          <div className="space-y-4 mt-4">
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>用户名:</strong> {viewingRecord.username || "无"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>真实姓名:</strong> {viewingRecord.realName || "无"}
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>邮箱:</strong> {viewingRecord.email || "未设置"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>手机:</strong> {viewingRecord.phone || "未设置"}
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>部门:</strong> {viewingRecord.department || "未设置"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>职位:</strong> {viewingRecord.position || "未设置"}
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>角色:</strong>{" "}
                  {roleTypeMap[viewingRecord.role]?.text || "未设置"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>状态:</strong>{" "}
                  {userStatusMap[viewingRecord.status]?.text || "未设置"}
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>创建时间:</strong>{" "}
                  {viewingRecord.createTime
                    ? new Date(viewingRecord.createTime).toLocaleString()
                    : "无"}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>最后登录:</strong>{" "}
                  {viewingRecord.lastLogin
                    ? new Date(viewingRecord.lastLogin).toLocaleString()
                    : "无"}
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <Spin tip="加载中..." />
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
