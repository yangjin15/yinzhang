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
  DatePicker,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { applicationAPI, authAPI } from "../services/api";

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const SealApplications = () => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [form] = Form.useForm();

  // 印章类型映射
  const sealTypeMap = {
    OFFICIAL: { text: "公章", color: "blue" },
    FINANCE: { text: "财务章", color: "green" },
    CONTRACT: { text: "合同章", color: "orange" },
    PERSONAL: { text: "个人印章", color: "purple" },
  };

  // 在组件加载时检查用户登录状态
  useEffect(() => {
    const checkUserStatus = () => {
      const user = authAPI.getCurrentUser();
      console.log("检查用户状态:", user);

      // 只在用户状态发生变化时更新
      if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
        const wasLoggedIn = !!currentUser;
        const isNowLoggedIn = !!user;

        setCurrentUser(user);

        // 只在用户从未登录变为已登录，且当前标签页是待审批时，才自动切换到我的申请
        if (!wasLoggedIn && isNowLoggedIn && activeTab === "pending") {
          console.log("用户刚登录，自动切换到我的申请标签页");
          setActiveTab("my");
        }
      }
    };

    checkUserStatus();

    // 监听localStorage变化（用户登录/登出时）
    const handleStorageChange = () => {
      checkUserStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    // 设置一个短暂的延迟检查，以处理同页面的localStorage变化
    const timer = setTimeout(checkUserStatus, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearTimeout(timer);
    };
  }, []); // 移除依赖，只在组件挂载时运行一次

  // 申请状态映射
  const statusMap = {
    PENDING: {
      text: "待审批",
      color: "processing",
      icon: <ClockCircleOutlined />,
    },
    APPROVED: {
      text: "已批准",
      color: "success",
      icon: <CheckCircleOutlined />,
    },
    REJECTED: {
      text: "已拒绝",
      color: "error",
      icon: <ExclamationCircleOutlined />,
    },
    COMPLETED: {
      text: "已完成",
      color: "default",
      icon: <CheckCircleOutlined />,
    },
  };

  // 分离数据获取的useEffect
  useEffect(() => {
    fetchApplications();
    fetchStatistics();
  }, [activeTab, currentPage, pageSize, searchKeyword, statusFilter]); // 移除currentUser依赖

  // 当用户状态变化时，重新获取数据
  useEffect(() => {
    if (currentUser !== null) {
      // 只有在用户状态确定后才获取数据
      fetchApplications();
      fetchStatistics();
    }
  }, [currentUser]); // 单独处理用户状态变化

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let response;
      const currentUser = authAPI.getCurrentUser();

      if (activeTab === "my") {
        // 获取我的申请
        if (currentUser) {
          response = await applicationAPI.getMyApplications(
            currentUser.username,
            {
              page: currentPage - 1,
              size: pageSize,
            }
          );
        } else {
          // 用户未登录，显示提示
          message.warning("请先登录以查看您的申请");
          setApplications([]);
          setTotal(0);
          setLoading(false);
          return;
        }
      } else if (activeTab === "pending") {
        // 获取待审批申请
        response = await applicationAPI.getPendingApplications({
          page: currentPage - 1,
          size: pageSize,
        });
      } else if (activeTab === "completed") {
        // 获取已完成申请
        response = await applicationAPI.getApplications({
          page: currentPage - 1,
          size: pageSize,
          status: "COMPLETED",
        });
      } else {
        // 获取所有申请
        const params = {
          page: currentPage - 1,
          size: pageSize,
          keyword: searchKeyword || undefined,
          status: statusFilter || undefined,
        };
        response = await applicationAPI.getApplications(params);
      }

      if (response && response.success) {
        setApplications(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        setApplications([]);
        setTotal(0);
        if (response && !response.success) {
          message.error(response.message || "获取申请列表失败");
        }
      }
    } catch (error) {
      console.error("获取申请列表失败:", error);
      message.error("获取申请列表失败：" + (error.message || "未知错误"));
      setApplications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await applicationAPI.getApplicationStatistics();
      if (response && response.success) {
        const stats = response.data;
        setStatistics({
          total: stats.totalApplications || 0,
          pending: stats.byStatus?.PENDING || 0,
          approved: stats.byStatus?.APPROVED || 0,
          rejected: stats.byStatus?.REJECTED || 0,
        });
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "申请信息",
      key: "applicationInfo",
      width: 280,
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileTextOutlined className="text-white text-sm" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {record.applicationNo}
              </div>
              <div className="text-sm text-gray-500">{record.purpose}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tag color={sealTypeMap[record.sealType]?.color}>
              {record.sealName}
            </Tag>
            <Tag
              color={statusMap[record.status]?.color}
              icon={statusMap[record.status]?.icon}
            >
              {statusMap[record.status]?.text}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "申请人信息",
      key: "applicantInfo",
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{record.applicant}</div>
          <div className="text-sm text-gray-500">{record.department}</div>
          <div className="text-xs text-gray-400">
            申请时间: {new Date(record.applyTime).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: "期望用印时间",
      dataIndex: "expectedTime",
      key: "expectedTime",
      width: 140,
      render: (time) => (
        <div className="text-sm text-gray-600">
          {new Date(time).toLocaleString()}
        </div>
      ),
    },
    {
      title: "审批人",
      dataIndex: "approver",
      key: "approver",
      width: 100,
      render: (approver) => (
        <span className="text-sm font-medium text-gray-700">{approver}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined className="text-gray-500" />}
              onClick={() => handleView(record)}
              className="hover:bg-blue-50 hover:text-blue-600"
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined className="text-gray-500" />}
                onClick={() => handleEdit(record)}
                className="hover:bg-green-50 hover:text-green-600"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (record) => {
    Modal.info({
      title: "申请详情",
      width: 700,
      content: (
        <div className="space-y-4 mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  申请编号
                </label>
                <div className="text-gray-900">{record.applicationNo}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  申请状态
                </label>
                <div>
                  <Tag
                    color={statusMap[record.status]?.color}
                    icon={statusMap[record.status]?.icon}
                  >
                    {statusMap[record.status]?.text}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  印章名称
                </label>
                <div className="text-gray-900">{record.sealName}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  申请人
                </label>
                <div className="text-gray-900">{record.applicant}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  部门
                </label>
                <div className="text-gray-900">{record.department}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  审批人
                </label>
                <div className="text-gray-900">{record.approver}</div>
              </div>
            </Col>
            <Col span={24}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  用印目的
                </label>
                <div className="text-gray-900">{record.purpose}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  申请时间
                </label>
                <div className="text-gray-900">
                  {new Date(record.applyTime).toLocaleString()}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  期望用印时间
                </label>
                <div className="text-gray-900">
                  {new Date(record.expectedTime).toLocaleString()}
                </div>
              </div>
            </Col>
            <Col span={24}>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  相关文件
                </label>
                <div className="text-gray-900">{record.documents}</div>
              </div>
            </Col>
          </Row>
        </div>
      ),
    });
  };

  const handleEdit = (record) => {
    setEditingApplication(record);
    form.setFieldsValue({
      ...record,
      expectedTime: record.expectedTime ? dayjs(record.expectedTime) : null,
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      message.warning("请先登录才能提交申请");
      return;
    }

    setEditingApplication(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!currentUser) {
        message.error("用户未登录，请重新登录");
        setLoading(false);
        return;
      }

      // 根据印章名称映射印章类型
      const sealTypeMapping = {
        公司公章: "OFFICIAL",
        财务专用章: "FINANCE",
        合同专用章: "CONTRACT",
        人事章: "PERSONAL",
      };

      // 准备提交数据
      const submitData = {
        ...values,
        applicant: currentUser.username,
        department: currentUser.department || values.department,
        sealType: sealTypeMapping[values.sealName] || "OFFICIAL", // 根据印章名称自动设置类型
        expectedTime: values.expectedTime
          ? values.expectedTime.format("YYYY-MM-DDTHH:mm:ss")
          : null,
      };

      console.log("提交数据:", submitData); // 添加调试日志

      let response;
      if (editingApplication) {
        // 更新申请
        response = await applicationAPI.updateApplication(
          editingApplication.id,
          submitData
        );
      } else {
        // 创建申请
        response = await applicationAPI.createApplication(submitData);
      }

      console.log("API响应:", response); // 添加调试日志

      if (response && response.success) {
        message.success(editingApplication ? "申请更新成功" : "申请提交成功");
        setIsModalVisible(false);
        form.resetFields();
        setEditingApplication(null);
        fetchApplications();
        fetchStatistics();
      } else {
        message.error(response?.message || "操作失败");
      }
    } catch (error) {
      console.error("提交申请失败:", error);
      message.error("操作失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="总申请数"
              value={statistics.total}
              valueStyle={{ color: "#3b82f6" }}
              prefix={<FileTextOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="待审批"
              value={statistics.pending}
              valueStyle={{ color: "#f59e0b" }}
              prefix={<ClockCircleOutlined className="text-yellow-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="已批准"
              value={statistics.approved}
              valueStyle={{ color: "#10b981" }}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="已拒绝"
              value={statistics.rejected}
              valueStyle={{ color: "#ef4444" }}
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card className="shadow-apple-lg">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<PlusOutlined className="text-white" />}
              onClick={handleAdd}
              className="button-primary"
            >
              新增申请
            </Button>
          }
        >
          <TabPane tab="我的申请" key="my">
            <div className="space-y-4">
              {/* 搜索和过滤区域 */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Search
                  placeholder="搜索申请编号或用印目的"
                  allowClear
                  enterButton={<SearchOutlined className="text-white" />}
                  size="large"
                  className="sm:w-80"
                  onSearch={setSearchKeyword}
                />
                <Select
                  placeholder="选择状态"
                  allowClear
                  size="large"
                  className="sm:w-40"
                  onChange={setStatusFilter}
                >
                  {Object.entries(statusMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
                <RangePicker
                  size="large"
                  placeholder={["开始日期", "结束日期"]}
                />
              </div>

              {/* 表格 */}
              <Table
                columns={columns}
                dataSource={applications}
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
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  },
                }}
                scroll={{ x: 1000 }}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </TabPane>

          <TabPane tab="待审批" key="pending">
            <div className="space-y-4">
              {/* 搜索和过滤区域 */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Search
                  placeholder="搜索申请编号或用印目的"
                  allowClear
                  enterButton={<SearchOutlined className="text-white" />}
                  size="large"
                  className="sm:w-80"
                  onSearch={setSearchKeyword}
                />
                <RangePicker
                  size="large"
                  placeholder={["开始日期", "结束日期"]}
                />
              </div>

              {/* 表格 */}
              <Table
                columns={columns}
                dataSource={applications}
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
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  },
                }}
                scroll={{ x: 1000 }}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </TabPane>

          <TabPane tab="已完成" key="completed">
            <div className="space-y-4">
              {/* 搜索和过滤区域 */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Search
                  placeholder="搜索申请编号或用印目的"
                  allowClear
                  enterButton={<SearchOutlined className="text-white" />}
                  size="large"
                  className="sm:w-80"
                  onSearch={setSearchKeyword}
                />
                <RangePicker
                  size="large"
                  placeholder={["开始日期", "结束日期"]}
                />
              </div>

              {/* 表格 */}
              <Table
                columns={columns}
                dataSource={applications}
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
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  },
                }}
                scroll={{ x: 1000 }}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 添加/编辑申请模态框 */}
      <Modal
        title={editingApplication ? "编辑申请" : "新增申请"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        className="rounded-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sealName"
                label="选择印章"
                rules={[{ required: true, message: "请选择印章" }]}
              >
                <Select placeholder="请选择需要使用的印章">
                  <Option value="公司公章">公司公章</Option>
                  <Option value="财务专用章">财务专用章</Option>
                  <Option value="合同专用章">合同专用章</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedTime"
                label="期望用印时间"
                rules={[{ required: true, message: "请选择期望用印时间" }]}
              >
                <DatePicker
                  showTime
                  className="w-full"
                  placeholder="选择日期时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="purpose"
            label="用印目的"
            rules={[{ required: true, message: "请输入用印目的" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请详细说明用印目的"
              className="input-apple"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="申请部门"
                rules={[{ required: true, message: "请输入申请部门" }]}
              >
                <Input placeholder="请输入申请部门" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="documents"
                label="相关文件"
                rules={[{ required: true, message: "请输入相关文件" }]}
              >
                <Input
                  placeholder="请输入相关文件名称"
                  className="input-apple"
                />
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
                {editingApplication ? "更新申请" : "提交申请"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SealApplications;
