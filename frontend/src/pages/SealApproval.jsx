import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Input,
  Row,
  Col,
  Statistic,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { applicationAPI, authAPI } from "../services/api";

const { TextArea } = Input;

const SealApproval = () => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [approveForm] = Form.useForm();
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processed: 0,
    averageDuration: "暂无数据",
    fastestApproval: null,
    slowestApproval: null,
    durationRanges: {},
  });

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
      icon: <CloseCircleOutlined />,
    },
    COMPLETED: {
      text: "已完成",
      color: "default",
      icon: <CheckCircleOutlined />,
    },
  };

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

  // 获取当前用户信息
  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user) {
      message.warning("请先登录以查看待审批申请");
      return;
    }
    setCurrentUser(user);
  }, []);

  // 获取待审批申请
  const fetchApplications = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    setLoading(true);
    try {
      let response;

      // 如果是管理员，获取所有待审批申请
      if (currentUser.role === "ADMIN") {
        response = await applicationAPI.getPendingApplications({
          page: currentPage - 1,
          size: pageSize,
        });
      } else {
        // 如果是普通用户，获取需要该用户审批的申请（基于保管人）
        response = await applicationAPI.getKeeperPendingApplications(
          currentUser.realName,
          {
            page: currentPage - 1,
            size: pageSize,
          }
        );
      }

      console.log("SealApproval - API响应:", response); // 添加调试日志

      if (response && response.success) {
        setApplications(response.data.list || []);
        setTotal(response.data.total || 0);

        // 更新统计信息
        setStatistics({
          total: response.data.total || 0,
          pending: response.data.total || 0,
          processed: 0,
        });
      } else {
        setApplications([]);
        setTotal(0);
        if (response && response.message) {
          message.error(response.message);
        }
      }
    } catch (error) {
      console.error("获取待审批申请错误:", error);
      message.error("获取待审批申请失败：" + (error.message || "网络错误"));
      setApplications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentPage, pageSize]);

  // 获取审批时长统计
  const fetchDurationStatistics = useCallback(async () => {
    try {
      const response = await applicationAPI.getApprovalDurationStatistics();
      if (response.success) {
        setStatistics((prev) => ({
          ...prev,
          averageDuration: response.data.averageDurationText || "暂无数据",
          fastestApproval: response.data.fastestApproval || null,
          slowestApproval: response.data.slowestApproval || null,
          durationRanges: response.data.durationRanges || {},
        }));
      }
    } catch (error) {
      console.error("获取审批时长统计错误:", error);
    }
  }, []);

  // 在组件加载时同时获取申请列表和统计数据
  useEffect(() => {
    fetchApplications();
    fetchDurationStatistics();
  }, [fetchApplications, fetchDurationStatistics]);

  // 查看申请详情
  const handleView = (record) => {
    setSelectedApplication(record);
    setIsModalVisible(true);
  };

  // 审批申请
  const handleApprove = async (id, status, remark = "") => {
    try {
      const response = await applicationAPI.approveApplication(
        id,
        status,
        currentUser.realName,
        remark
      );

      if (response.success) {
        message.success(status === "APPROVED" ? "申请已批准" : "申请已拒绝");
        fetchApplications(); // 刷新列表
        setIsModalVisible(false);
        approveForm.resetFields();
      } else {
        message.error(response.message || "审批失败");
      }
    } catch (error) {
      console.error("审批申请错误:", error);
      message.error("审批失败：" + (error.message || "网络错误"));
    }
  };

  // 提交审批
  const handleSubmitApproval = async (values) => {
    if (!selectedApplication) return;

    await handleApprove(
      selectedApplication.id,
      values.status,
      values.remark || ""
    );
  };

  // 表格列定义
  const columns = [
    {
      title: "申请编号",
      dataIndex: "applicationNo",
      key: "applicationNo",
      width: 120,
      render: (no) => (
        <span className="font-mono text-sm text-blue-600">{no}</span>
      ),
    },
    {
      title: "申请信息",
      key: "applicationInfo",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserOutlined className="text-gray-400" />
            <span className="font-medium">{record.applicant}</span>
          </div>
          <div className="text-sm text-gray-600">{record.department}</div>
          <div className="text-xs text-gray-500">
            {new Date(record.applyTime).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: "印章信息",
      key: "sealInfo",
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <SafetyOutlined className="text-blue-500" />
            <span className="font-medium">{record.sealName}</span>
          </div>
          <div className="flex space-x-1">
            <Tag color={sealTypeMap[record.sealType]?.color} size="small">
              {sealTypeMap[record.sealType]?.text}
            </Tag>
            <Tag color={sealShapeMap[record.sealShape]?.color} size="small">
              {sealShapeMap[record.sealShape]?.text}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "文件信息",
      key: "fileInfo",
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{record.fileName}</div>
          <div className="text-xs text-gray-600">致: {record.addressee}</div>
          <div className="text-xs text-gray-600">份数: {record.copies}</div>
        </div>
      ),
    },
    {
      title: "用印目的",
      dataIndex: "purpose",
      key: "purpose",
      width: 200,
      render: (purpose) => (
        <div className="text-sm text-gray-700 line-clamp-2">{purpose}</div>
      ),
    },
    {
      title: "期望时间",
      dataIndex: "expectedTime",
      key: "expectedTime",
      width: 120,
      render: (time) => (
        <div className="text-sm text-gray-600">
          {new Date(time).toLocaleString()}
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status) => (
        <Tag color={statusMap[status]?.color} icon={statusMap[status]?.icon}>
          {statusMap[status]?.text}
        </Tag>
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
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              className="hover:bg-blue-50 hover:text-blue-600"
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <>
              <Tooltip title="批准">
                <Popconfirm
                  title="确定要批准这个申请吗？"
                  onConfirm={() => handleApprove(record.id, "APPROVED")}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    icon={<CheckCircleOutlined />}
                    className="hover:bg-green-50 hover:text-green-600"
                  />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="拒绝">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleView(record)}
                  className="hover:bg-red-50 hover:text-red-600"
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (!currentUser) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Card className="text-center">
          <div className="py-8">
            <UserOutlined className="text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">请先登录</h3>
            <p className="text-gray-600">您需要登录后才能查看待审批申请</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">印章审批</h1>
        <p className="text-gray-600">
          您好，{currentUser.realName}！
          {currentUser.role === "ADMIN"
            ? "作为管理员，您可以审批所有待审批的印章使用申请"
            : "这里是需要您审批的印章使用申请（您是相关印章的保管人）"}
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="待审批申请"
              value={statistics.pending}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="今日处理"
              value={statistics.processed}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="总申请数"
              value={statistics.total}
              prefix={<FileTextOutlined className="text-blue-500" />}
              valueStyle={{ color: "#3b82f6" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 审批时长统计 */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="平均审批时长"
              value={statistics.averageDuration}
              prefix={<ClockCircleOutlined className="text-purple-500" />}
              valueStyle={{ color: "#8b5cf6" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">最快审批</div>
              <div className="text-lg font-semibold text-green-600">
                {statistics.fastestApproval
                  ? statistics.fastestApproval.text
                  : "暂无数据"}
              </div>
              {statistics.fastestApproval && (
                <div className="text-xs text-gray-400 mt-1">
                  {statistics.fastestApproval.applicationNo}
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">最慢审批</div>
              <div className="text-lg font-semibold text-red-600">
                {statistics.slowestApproval
                  ? statistics.slowestApproval.text
                  : "暂无数据"}
              </div>
              {statistics.slowestApproval && (
                <div className="text-xs text-gray-400 mt-1">
                  {statistics.slowestApproval.applicationNo}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 审批时长分布 */}
      {Object.keys(statistics.durationRanges).length > 0 && (
        <Card className="shadow-apple-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            审批时长分布
          </h3>
          <Row gutter={16}>
            <Col xs={24} sm={8} md={4}>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.durationRanges.within1Hour || 0}
                </div>
                <div className="text-sm text-gray-600">1小时内</div>
              </div>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.durationRanges.within1Day || 0}
                </div>
                <div className="text-sm text-gray-600">1天内</div>
              </div>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {statistics.durationRanges.within3Days || 0}
                </div>
                <div className="text-sm text-gray-600">3天内</div>
              </div>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {statistics.durationRanges.within7Days || 0}
                </div>
                <div className="text-sm text-gray-600">7天内</div>
              </div>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {statistics.durationRanges.moreThan7Days || 0}
                </div>
                <div className="text-sm text-gray-600">超过7天</div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* 主要内容卡片 */}
      <Card className="shadow-apple-lg">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            待审批申请列表
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            只显示您作为保管人的印章的相关申请
          </p>
        </div>

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
      </Card>

      {/* 审批模态框 */}
      <Modal
        title="审批申请"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedApplication(null);
          approveForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        {selectedApplication && (
          <div className="space-y-4">
            {/* 申请详情 */}
            <Card size="small" title="申请详情" className="mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="space-y-2">
                    <div>
                      <strong>申请编号：</strong>
                      {selectedApplication.applicationNo}
                    </div>
                    <div>
                      <strong>申请人：</strong>
                      {selectedApplication.applicant}
                    </div>
                    <div>
                      <strong>申请部门：</strong>
                      {selectedApplication.department}
                    </div>
                    <div>
                      <strong>印章名称：</strong>
                      {selectedApplication.sealName}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <div>
                      <strong>文件名称：</strong>
                      {selectedApplication.fileName}
                    </div>
                    <div>
                      <strong>致何处：</strong>
                      {selectedApplication.addressee}
                    </div>
                    <div>
                      <strong>份数：</strong>
                      {selectedApplication.copies}
                    </div>
                    <div>
                      <strong>期望时间：</strong>
                      {new Date(
                        selectedApplication.expectedTime
                      ).toLocaleString()}
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="mt-3">
                <div>
                  <strong>用印目的：</strong>
                </div>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {selectedApplication.purpose}
                </div>
              </div>
            </Card>

            {/* 审批表单 */}
            <Form
              form={approveForm}
              layout="vertical"
              onFinish={handleSubmitApproval}
            >
              <Form.Item
                name="status"
                label="审批结果"
                rules={[{ required: true, message: "请选择审批结果" }]}
              >
                <Space direction="vertical" className="w-full">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    className="w-full"
                    onClick={() => {
                      approveForm.setFieldsValue({ status: "APPROVED" });
                      approveForm.submit();
                    }}
                  >
                    批准申请
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    className="w-full"
                    onClick={() =>
                      approveForm.setFieldsValue({ status: "REJECTED" })
                    }
                  >
                    拒绝申请
                  </Button>
                </Space>
              </Form.Item>

              <Form.Item name="remark" label="审批备注">
                <TextArea rows={3} placeholder="请输入审批备注（选填）" />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => {
                      setIsModalVisible(false);
                      setSelectedApplication(null);
                      approveForm.resetFields();
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!approveForm.getFieldValue("status")}
                  >
                    确认审批
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SealApproval;
