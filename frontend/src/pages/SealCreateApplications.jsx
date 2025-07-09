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
  Popconfirm,
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
  DeleteOutlined,
} from "@ant-design/icons";
import { sealCreateApplicationAPI, authAPI } from "../services/api";

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const SealCreateApplications = () => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("my");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    byStatus: {},
    averageProcessingTime: 0,
  });
  const [form] = Form.useForm();
  const [viewingRecord, setViewingRecord] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [approvalForm] = Form.useForm();

  // 印章类型映射
  const sealTypeMap = {
    OFFICIAL: { text: "公章", color: "blue" },
    FINANCE: { text: "财务章", color: "green" },
    CONTRACT: { text: "合同章", color: "orange" },
    PERSONAL: { text: "个人印章", color: "purple" },
    LEGAL: { text: "法人章", color: "red" },
    HR: { text: "人事章", color: "cyan" },
  };

  // 印章形状映射
  const sealShapeMap = {
    ROUND: { text: "圆形", color: "blue" },
    SQUARE: { text: "方形", color: "green" },
    OVAL: { text: "椭圆形", color: "orange" },
  };

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
  };

  // 获取当前用户
  useEffect(() => {
    const user = authAPI.getCurrentUser();
    console.log("SealCreateApplications - 当前用户:", user); // 添加调试日志
    setCurrentUser(user);
  }, []);

  // 获取数据
  useEffect(() => {
    console.log(
      "SealCreateApplications - useEffect触发, activeTab:",
      activeTab,
      "currentUser:",
      currentUser
    ); // 添加调试日志
    fetchApplications();
    fetchStatistics();
  }, [
    activeTab,
    currentPage,
    pageSize,
    searchKeyword,
    statusFilter,
    currentUser,
  ]);

  const fetchApplications = async () => {
    console.log(
      "SealCreateApplications - fetchApplications开始执行, activeTab:",
      activeTab,
      "currentUser:",
      currentUser
    ); // 添加调试日志
    setLoading(true);
    try {
      let response;

      if (activeTab === "my") {
        // 获取我的申请
        if (currentUser) {
          response = await sealCreateApplicationAPI.getMyApplications(
            currentUser.username,
            {
              page: currentPage - 1,
              size: pageSize,
            }
          );
        } else {
          message.warning("请先登录以查看您的申请");
          setApplications([]);
          setTotal(0);
          setLoading(false);
          return;
        }
      } else if (activeTab === "pending") {
        // 获取待审批申请
        response = await sealCreateApplicationAPI.getPendingApplications({
          page: currentPage - 1,
          size: pageSize,
        });
      } else {
        // 获取所有申请
        const params = {
          page: currentPage - 1,
          size: pageSize,
          keyword: searchKeyword || undefined,
          status: statusFilter || undefined,
        };
        response = await sealCreateApplicationAPI.getApplications(params);
      }

      console.log("API响应:", response); // 添加调试日志

      if (response && response.success) {
        console.log("获取到的申请数据:", response.data); // 添加调试日志
        setApplications(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        console.error("获取申请失败:", response); // 添加调试日志
        setApplications([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("获取申请列表失败:", error);
      message.error("获取申请列表失败");
      setApplications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response =
        await sealCreateApplicationAPI.getApplicationStatistics();
      console.log("统计数据API响应:", response); // 添加调试日志
      if (response && response.success) {
        console.log("统计数据:", response.data); // 添加调试日志
        setStatistics(response.data);
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
      width: 300,
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
              <div className="text-sm text-gray-500">{record.sealName}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tag color={sealTypeMap[record.sealType]?.color}>
              {sealTypeMap[record.sealType]?.text}
            </Tag>
            <Tag color={sealShapeMap[record.sealShape]?.color}>
              {sealShapeMap[record.sealShape]?.text}
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
          <div className="text-sm text-gray-500">
            {record.applicantDepartment}
          </div>
          <div className="text-xs text-gray-400">
            申请时间: {new Date(record.applyTime).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: "印章信息",
      key: "sealInfo",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-gray-600">所属：</span>
            <span className="font-medium">{record.ownerDepartment}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">保管：</span>
            <span className="font-medium">{record.keeperDepartment}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">保管人：</span>
            <span className="font-medium">{record.keeper}</span>
          </div>
        </div>
      ),
    },
    {
      title: "审批信息",
      key: "approvalInfo",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          {record.approver && (
            <div className="text-sm">
              <span className="text-gray-600">审批人：</span>
              <span className="font-medium">{record.approver}</span>
            </div>
          )}
          {record.approveTime && (
            <div className="text-xs text-gray-400">
              审批时间: {new Date(record.approveTime).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
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
            <>
              {currentUser && record.applicant === currentUser.username && (
                <>
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      icon={<EditOutlined className="text-gray-500" />}
                      onClick={() => handleEdit(record)}
                      className="hover:bg-green-50 hover:text-green-600"
                    />
                  </Tooltip>
                  <Tooltip title="撤回申请">
                    <Popconfirm
                      title="确定要撤回这个申请吗？"
                      description="撤回后无法恢复，请确认操作。"
                      onConfirm={() => handleWithdraw(record.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined className="text-gray-500" />}
                        className="hover:bg-red-50 hover:text-red-600"
                      />
                    </Popconfirm>
                  </Tooltip>
                </>
              )}
              {currentUser && currentUser.role === "ADMIN" && (
                <Tooltip title="审批">
                  <Button
                    size="small"
                    onClick={() => handleApprove(record)}
                    style={{
                      backgroundColor: "#10b981",
                      borderColor: "#10b981",
                      color: "#000000",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#059669";
                      e.target.style.borderColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#10b981";
                      e.target.style.borderColor = "#10b981";
                    }}
                  >
                    审批
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (record) => {
    console.log("查看详情 - 记录数据:", record);

    try {
      setViewingRecord(record);
      setIsViewModalVisible(true);
    } catch (error) {
      console.error("显示详情时出错:", error);
      message.error("无法显示详情，请重试");
    }
  };

  const handleEdit = (record) => {
    setEditingApplication(record);
    form.setFieldsValue({
      ...record,
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    if (!currentUser) {
      message.warning("请先登录才能提交申请");
      return;
    }

    setEditingApplication(null);
    form.resetFields();
    form.setFieldsValue({
      applicant: currentUser.username,
      applicantDepartment: currentUser.department || "",
    });
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

      const submitData = {
        ...values,
        applicant: currentUser.username,
        applicantDepartment:
          currentUser.department || values.applicantDepartment,
      };

      let response;
      if (editingApplication) {
        response = await sealCreateApplicationAPI.updateApplication(
          editingApplication.id,
          submitData
        );
      } else {
        response = await sealCreateApplicationAPI.createApplication(submitData);
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

  const handleWithdraw = async (id) => {
    try {
      const response = await sealCreateApplicationAPI.withdrawApplication(id, {
        applicant: currentUser.username,
      });
      if (response && response.success) {
        message.success("申请撤回成功");
        fetchApplications();
        fetchStatistics();
      } else {
        message.error(response?.message || "撤回失败");
      }
    } catch (error) {
      message.error("撤回失败：" + error.message);
    }
  };

  const handleApprove = (record) => {
    setApprovalRecord(record);
    approvalForm.setFieldsValue({
      remark: "", // 清空审批意见
    });
    setIsApprovalModalVisible(true);
  };

  const handleApprovalSubmit = async (id, status) => {
    try {
      const values = approvalForm.getFieldsValue();
      const remark = values.remark || "";

      const response = await sealCreateApplicationAPI.approveApplication(id, {
        status,
        approver: currentUser.username,
        remark,
      });

      if (response && response.success) {
        message.success(`申请${status === "APPROVED" ? "批准" : "拒绝"}成功`);
        setIsApprovalModalVisible(false);
        approvalForm.resetFields();
        fetchApplications();
        fetchStatistics();
      } else {
        message.error(response?.message || "审批失败");
      }
    } catch (error) {
      message.error("审批失败：" + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="总申请数"
              value={statistics.totalApplications}
              valueStyle={{ color: "#3b82f6" }}
              prefix={<FileTextOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="待审批"
              value={statistics.byStatus?.PENDING || 0}
              valueStyle={{ color: "#f59e0b" }}
              prefix={<ClockCircleOutlined className="text-yellow-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="已批准"
              value={statistics.byStatus?.APPROVED || 0}
              valueStyle={{ color: "#10b981" }}
              prefix={<CheckCircleOutlined className="text-green-500" />}
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
          items={[
            {
              key: "my",
              label: "我的申请",
              children: (
                <div className="space-y-4">
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
                    scroll={{ x: 1200 }}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              ),
            },
            {
              key: "pending",
              label: "待审批",
              children: (
                <div className="space-y-4">
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
                    scroll={{ x: 1200 }}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              ),
            },
            {
              key: "all",
              label: "所有申请",
              children: (
                <div className="space-y-4">
                  {/* 搜索和过滤区域 */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Search
                      placeholder="搜索申请编号或印章名称"
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
                    scroll={{ x: 1200 }}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 添加/编辑申请模态框 */}
      <Modal
        title={editingApplication ? "编辑申请" : "新增印章申请"}
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
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: "请输入申请人" }]}
              >
                <Input
                  placeholder="请输入申请人"
                  className="input-apple"
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applicantDepartment"
                label="申请部门"
                rules={[{ required: true, message: "请输入申请部门" }]}
              >
                <Input placeholder="请输入申请部门" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sealName"
                label="印章名称"
                rules={[{ required: true, message: "请输入印章名称" }]}
              >
                <Input placeholder="请输入印章名称" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sealType"
                label="印章类型"
                rules={[{ required: true, message: "请选择印章类型" }]}
              >
                <Select placeholder="请选择印章类型">
                  <Option value="OFFICIAL">公章</Option>
                  <Option value="FINANCE">财务章</Option>
                  <Option value="CONTRACT">合同章</Option>
                  <Option value="LEGAL">法人章</Option>
                  <Option value="HR">人事章</Option>
                  <Option value="PERSONAL">个人印章</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sealShape"
                label="印章形状"
                rules={[{ required: true, message: "请选择印章形状" }]}
              >
                <Select placeholder="请选择印章形状">
                  <Option value="ROUND">圆形</Option>
                  <Option value="SQUARE">方形</Option>
                  <Option value="OVAL">椭圆形</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ownerDepartment"
                label="所属部门"
                rules={[{ required: true, message: "请输入所属部门" }]}
              >
                <Input placeholder="请输入所属部门" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="keeperDepartment"
                label="保管部门"
                rules={[{ required: true, message: "请输入保管部门" }]}
              >
                <Input placeholder="请输入保管部门" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="keeper"
                label="保管人"
                rules={[{ required: true, message: "请输入保管人" }]}
              >
                <Input placeholder="请输入保管人" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="申请说明">
            <Input.TextArea
              rows={3}
              placeholder="请输入申请说明（可选）"
              className="input-apple"
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="button-primary"
              >
                {editingApplication ? "更新申请" : "提交申请"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看详情模态框 */}
      <Modal
        title="印章申请详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={700}
        className="rounded-lg"
      >
        {viewingRecord && (
          <div className="space-y-4 mt-4">
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    申请编号
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.applicationNo || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    申请状态
                  </label>
                  <div>
                    <Tag
                      color={statusMap[viewingRecord.status]?.color}
                      icon={statusMap[viewingRecord.status]?.icon}
                    >
                      {statusMap[viewingRecord.status]?.text || "无"}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    印章名称
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.sealName || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    印章类型
                  </label>
                  <div>
                    <Tag color={sealTypeMap[viewingRecord.sealType]?.color}>
                      {sealTypeMap[viewingRecord.sealType]?.text || "无"}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    印章形状
                  </label>
                  <div>
                    <Tag color={sealShapeMap[viewingRecord.sealShape]?.color}>
                      {sealShapeMap[viewingRecord.sealShape]?.text || "无"}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    申请人
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.applicant || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    申请部门
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.applicantDepartment || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    所属部门
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.ownerDepartment || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    保管部门
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.keeperDepartment || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    保管人
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.keeper || "无"}
                  </div>
                </div>
              </Col>
              <Col span={24}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    申请描述
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.description || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    申请时间
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.applyTime
                      ? new Date(viewingRecord.applyTime).toLocaleString()
                      : "无"}
                  </div>
                </div>
              </Col>
              {viewingRecord.approver && (
                <Col span={12}>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      审批人
                    </label>
                    <div className="text-gray-900">
                      {viewingRecord.approver}
                    </div>
                  </div>
                </Col>
              )}
              {viewingRecord.approveTime && (
                <Col span={12}>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      审批时间
                    </label>
                    <div className="text-gray-900">
                      {new Date(viewingRecord.approveTime).toLocaleString()}
                    </div>
                  </div>
                </Col>
              )}
              {viewingRecord.approveRemark && (
                <Col span={24}>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      审批意见
                    </label>
                    <div className="text-gray-900">
                      {viewingRecord.approveRemark}
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* 审批模态框 */}
      <Modal
        title="印章申请审批"
        open={isApprovalModalVisible}
        onCancel={() => setIsApprovalModalVisible(false)}
        footer={null}
        width={700}
        className="rounded-lg"
      >
        {approvalRecord && (
          <div className="space-y-4 mt-4">
            <div>
              <strong>申请信息：</strong>
              <div className="ml-4 mt-2">
                <p>申请编号：{approvalRecord.applicationNo}</p>
                <p>印章名称：{approvalRecord.sealName}</p>
                <p>申请人：{approvalRecord.applicant}</p>
                <p>申请部门：{approvalRecord.applicantDepartment}</p>
              </div>
            </div>
            <Form form={approvalForm} layout="vertical">
              <Form.Item name="remark" label="审批意见">
                <Input.TextArea rows={3} placeholder="请输入审批意见（可选）" />
              </Form.Item>
            </Form>
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsApprovalModalVisible(false)}>
                取消
              </Button>
              <Button
                style={{
                  backgroundColor: "#dc2626",
                  borderColor: "#dc2626",
                  color: "#ffffff",
                }}
                onClick={() =>
                  handleApprovalSubmit(approvalRecord.id, "REJECTED")
                }
                loading={loading}
              >
                拒绝
              </Button>
              <Button
                style={{
                  backgroundColor: "#10b981",
                  borderColor: "#10b981",
                  color: "#ffffff",
                }}
                onClick={() =>
                  handleApprovalSubmit(approvalRecord.id, "APPROVED")
                }
                loading={loading}
              >
                批准
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SealCreateApplications;
