import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  InputNumber,
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
  Upload,
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
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { sealCreateApplicationAPI, authAPI, fileAPI } from "../services/api";

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const SealApplications = ({ currentTab = "pending" }) => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(currentTab);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);

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

  // 监听currentTab参数变化，更新activeTab
  useEffect(() => {
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
      setCurrentPage(1); // 重置页码
    }
  }, [currentTab]);

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
    // 注意：印章创建申请没有COMPLETED状态，已批准就是最终状态
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
          response = await sealCreateApplicationAPI.getMyApplications(
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
        response = await sealCreateApplicationAPI.getPendingApplications({
          page: currentPage - 1,
          size: pageSize,
        });
      } else if (activeTab === "completed") {
        // 获取已完成申请 - 修正：对于印章创建申请，已完成就是已批准
        response = await sealCreateApplicationAPI.getApplications({
          page: currentPage - 1,
          size: pageSize,
          status: "APPROVED", // 修正：使用APPROVED而不是COMPLETED
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
      const response =
        await sealCreateApplicationAPI.getApplicationStatistics();
      console.log("统计数据API响应:", response); // 添加调试日志
      if (response && response.success) {
        const stats = response.data;
        console.log("统计数据:", stats); // 添加调试日志
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
            <span className="text-gray-600">印章名称：</span>
            <span className="font-medium">{record.sealName}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">所属部门：</span>
            <span className="font-medium">{record.ownerDepartment}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">保管部门：</span>
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
      title: "审批人",
      dataIndex: "approver",
      key: "approver",
      width: 100,
      render: (approver) => (
        <span className="text-sm font-medium text-gray-700">
          {approver || "待分配"}
        </span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 180,
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
              <Tooltip title="编辑">
                <Button
                  type="text"
                  icon={<EditOutlined className="text-gray-500" />}
                  onClick={() => handleEdit(record)}
                  className="hover:bg-green-50 hover:text-green-600"
                />
              </Tooltip>
              {currentUser && record.applicant === currentUser.username && (
                <Tooltip title="撤销申请">
                  <Popconfirm
                    title="确定要撤销这个申请吗？"
                    description="撤销后无法恢复，请确认操作。"
                    onConfirm={() =>
                      handleWithdrawApplication(record.id, record.applicant)
                    }
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
              )}
            </>
          )}
          {record.attachmentUrl && (
            <Tooltip title="下载附件">
              <Button
                type="text"
                icon={<DownloadOutlined className="text-gray-500" />}
                onClick={() => window.open(record.attachmentUrl, "_blank")}
                className="hover:bg-purple-50 hover:text-purple-600"
              />
            </Tooltip>
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
      expectedTime: record.expectedTime ? dayjs(record.expectedTime) : null,
      sealShape: record.sealShape || "ROUND", // 默认圆形
      sealOwnerDepartment: record.ownerDepartment || record.applicantDepartment,
      sealKeeperDepartment:
        record.keeperDepartment || record.applicantDepartment,
    });

    // 如果有附件信息，设置文件列表
    if (record.attachmentName && record.attachmentUrl) {
      setFileList([
        {
          uid: "-1",
          name: record.attachmentName,
          status: "done",
          url: record.attachmentUrl,
          response: {
            success: true,
            filename: record.attachmentName,
            url: record.attachmentUrl,
          },
        },
      ]);
    } else {
      setFileList([]);
    }

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
    setFileList([]); // 清空文件列表

    // 设置默认值
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

      // 根据印章名称映射印章类型
      const sealTypeMapping = {
        公司公章: "OFFICIAL",
        财务专用章: "FINANCE",
        合同专用章: "CONTRACT",
        人事专用章: "HR",
      };

      // 准备提交数据
      const submitData = {
        ...values,
        applicant: currentUser.username,
        applicantDepartment:
          currentUser.department || values.applicantDepartment,
        sealType: sealTypeMapping[values.sealName] || "OFFICIAL", // 根据印章名称自动设置类型
        sealShape: values.sealShape, // 印章形状
        ownerDepartment: values.sealOwnerDepartment, // 所属部门
        keeperDepartment: values.sealKeeperDepartment, // 保管部门
        expectedTime: values.expectedTime
          ? values.expectedTime.format("YYYY-MM-DDTHH:mm:ss")
          : null,
      };

      console.log("提交数据:", submitData); // 添加调试日志

      let response;
      if (editingApplication) {
        // 更新申请
        response = await sealCreateApplicationAPI.updateApplication(
          editingApplication.id,
          submitData
        );
      } else {
        // 创建申请
        response = await sealCreateApplicationAPI.createApplication(submitData);
      }

      console.log("API响应:", response); // 添加调试日志

      if (response && response.success) {
        message.success(editingApplication ? "申请更新成功" : "申请提交成功");
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]); // 清空文件列表
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

  // 文件上传处理
  const handleFileUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);

    try {
      const response = await fileAPI.uploadFile(file, "attachment");
      if (response.success) {
        onSuccess(response.data);
        message.success("文件上传成功");
      } else {
        onError(new Error(response.message || "上传失败"));
        message.error("文件上传失败");
      }
    } catch (error) {
      onError(error);
      message.error("文件上传失败：" + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 处理文件列表变化
  const handleFileChange = (info) => {
    let newFileList = [...info.fileList];

    // 限制文件数量
    newFileList = newFileList.slice(-1);

    // 只保留成功上传的文件
    newFileList = newFileList.filter((file) => {
      if (file.response) {
        return file.response.success;
      }
      return true;
    });

    setFileList(newFileList);

    // 更新表单值
    if (newFileList.length > 0 && newFileList[0].response) {
      form.setFieldsValue({
        attachmentName: newFileList[0].response.filename,
        attachmentUrl: newFileList[0].response.url,
      });
    } else {
      form.setFieldsValue({
        attachmentName: "",
        attachmentUrl: "",
      });
    }
  };

  // 撤销申请
  const handleWithdrawApplication = async (id, applicant) => {
    try {
      const response = await sealCreateApplicationAPI.withdrawApplication(id, {
        applicant,
      });
      if (response && response.success) {
        message.success("申请撤销成功");
        fetchApplications(); // 刷新列表
        fetchStatistics();
      } else {
        message.error(response?.message || "撤销失败");
      }
    } catch (error) {
      message.error("撤销失败：" + error.message);
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
          items={[
            {
              key: "my",
              label: "我的申请",
              children: (
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
                    scroll={{ x: 1200 }}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              ),
            },
            {
              key: "completed",
              label: "已批准", // 修正：改为"已批准"而不是"已完成"
              children: (
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
                name="applicant"
                label="申请人"
                rules={[{ required: true, message: "请输入申请人" }]}
              >
                <Input placeholder="请输入申请人" className="input-apple" />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fileName"
                label="文件名称"
                rules={[{ required: true, message: "请输入文件名称" }]}
              >
                <Input placeholder="请输入文件名称" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="addressee"
                label="致何处"
                rules={[{ required: true, message: "请输入致何处" }]}
              >
                <Input placeholder="请输入致何处" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="copies"
                label="份数"
                rules={[
                  { required: true, message: "请输入份数" },
                  {
                    validator: (_, value) => {
                      if (!value || value < 1) {
                        return Promise.reject(new Error("份数必须大于0"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  placeholder="请输入份数"
                  className="input-apple w-full"
                />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="上传材料附件">
                <Upload
                  customRequest={handleFileUpload}
                  onChange={handleFileChange}
                  fileList={fileList}
                  maxCount={1}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg,.xls,.xlsx"
                  beforeUpload={(file) => {
                    const isValidType = [
                      "application/pdf",
                      "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "text/plain",
                      "image/jpeg",
                      "image/png",
                      "image/jpg",
                      "application/vnd.ms-excel",
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    ].includes(file.type);

                    if (!isValidType) {
                      message.error(
                        "只支持上传 PDF、Word、Excel、图片和文本文件！"
                      );
                      return false;
                    }

                    const isValidSize = file.size / 1024 / 1024 < 10;
                    if (!isValidSize) {
                      message.error("文件大小不能超过 10MB！");
                      return false;
                    }

                    return true;
                  }}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploading}
                    disabled={fileList.length >= 1}
                  >
                    {uploading ? "上传中..." : "选择文件"}
                  </Button>
                </Upload>
                <div className="text-xs text-gray-500 mt-1">
                  支持 PDF、Word、Excel、图片等格式，大小不超过 10MB
                </div>
              </Form.Item>
              {/* 隐藏的表单字段用于存储文件信息 */}
              <Form.Item name="attachmentName" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="attachmentUrl" hidden>
                <Input />
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

      {/* 查看详情模态框 */}
      <Modal
        title="申请详情"
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
                    部门
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.department || "无"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    审批人
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.approver || "无"}
                  </div>
                </div>
              </Col>
              <Col span={24}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    用印目的
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.purpose || "无"}
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
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    期望用印时间
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.expectedTime
                      ? new Date(viewingRecord.expectedTime).toLocaleString()
                      : "无"}
                  </div>
                </div>
              </Col>
              <Col span={24}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    相关文件
                  </label>
                  <div className="text-gray-900">
                    {viewingRecord.documents || "无"}
                  </div>
                </div>
              </Col>
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
    </div>
  );
};

export default SealApplications;
