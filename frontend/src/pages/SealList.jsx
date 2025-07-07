import React, { useState, useEffect, useCallback } from "react";
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
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SafetyOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { sealAPI } from "../services/api";

const { Option } = Select;
const { Search } = Input;

const SealList = () => {
  const [loading, setLoading] = useState(false);
  const [seals, setSeals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSeal, setEditingSeal] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    inUse: 0,
    destroyed: 0,
    lost: 0,
    suspended: 0,
  });
  const [form] = Form.useForm();

  // 印章类型映射
  const sealTypeMap = {
    OFFICIAL: { text: "公章", color: "blue" },
    FINANCE: { text: "财务章", color: "green" },
    CONTRACT: { text: "合同章", color: "orange" },
    PERSONAL: { text: "个人印章", color: "purple" },
    LEGAL: { text: "法人章", color: "red" },
    HR: { text: "人事章", color: "cyan" },
  };

  // 印章状态映射
  const sealStatusMap = {
    IN_USE: { text: "在用", color: "success" },
    DESTROYED: { text: "已销毁", color: "error" },
    LOST: { text: "丢失", color: "warning" },
    SUSPENDED: { text: "暂停使用", color: "default" },
  };

  // 印章形状映射
  const sealShapeMap = {
    ROUND: { text: "圆形", color: "blue" },
    SQUARE: { text: "方形", color: "green" },
    OVAL: { text: "椭圆形", color: "orange" },
  };

  // 获取印章列表
  const fetchSeals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sealAPI.getSeals({
        page: currentPage,
        size: pageSize,
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });

      if (response.success) {
        setSeals(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        setSeals([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("获取印章列表错误:", error);
      message.error("获取印章列表失败：" + (error.message || "网络错误"));
      setSeals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchKeyword, statusFilter, typeFilter]);

  // 获取统计信息
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await sealAPI.getSealStatistics();
      if (response.success) {
        const stats = response.data;
        setStatistics({
          total: stats.total || 0,
          inUse: stats.byStatus?.IN_USE || 0,
          destroyed: stats.byStatus?.DESTROYED || 0,
          lost: stats.byStatus?.LOST || 0,
          suspended: stats.byStatus?.SUSPENDED || 0,
        });
      }
    } catch (error) {
      console.error("获取统计信息错误:", error);
      message.error("获取统计信息失败：" + (error.message || "网络错误"));
    }
  }, []);

  useEffect(() => {
    fetchSeals();
    fetchStatistics();
  }, [fetchSeals, fetchStatistics]);

  // 表格列定义
  const columns = [
    {
      title: "序号",
      key: "index",
      width: 60,
      render: (_, record, index) => (
        <span className="text-sm text-gray-600">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "印章名称",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (name, record) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <SafetyOutlined className="text-white text-sm" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-500">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: "印章种类",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => (
        <Tag color={sealTypeMap[type]?.color}>{sealTypeMap[type]?.text}</Tag>
      ),
    },
    {
      title: "印章状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={sealStatusMap[status]?.color}>
          {sealStatusMap[status]?.text}
        </Tag>
      ),
    },
    {
      title: "印章形状",
      dataIndex: "shape",
      key: "shape",
      width: 100,
      render: (shape) => (
        <Tag color={sealShapeMap[shape]?.color}>
          {sealShapeMap[shape]?.text}
        </Tag>
      ),
    },
    {
      title: "所属部门",
      dataIndex: "ownerDepartment",
      key: "ownerDepartment",
      width: 120,
      render: (dept) => <span className="text-sm text-gray-700">{dept}</span>,
    },
    {
      title: "保管部门",
      dataIndex: "keeperDepartment",
      key: "keeperDepartment",
      width: 120,
      render: (dept) => <span className="text-sm text-gray-700">{dept}</span>,
    },
    {
      title: "保管人",
      dataIndex: "keeper",
      key: "keeper",
      width: 100,
      render: (keeper, record) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <UserOutlined className="text-gray-400 text-xs" />
            <span className="text-sm font-medium">{keeper}</span>
          </div>
          <div className="flex items-center space-x-1">
            <PhoneOutlined className="text-gray-400 text-xs" />
            <span className="text-xs text-gray-600">{record.keeperPhone}</span>
          </div>
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
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined className="text-gray-500" />}
              onClick={() => handleEdit(record)}
              className="hover:bg-green-50 hover:text-green-600"
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个印章吗？"
              onConfirm={() => handleDelete(record.id)}
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
        </Space>
      ),
    },
  ];

  // 处理查看详情
  const handleView = (record) => {
    console.log("查看详情 - 记录数据:", record);

    try {
      Modal.info({
        title: "印章详情",
        width: 600,
        content: (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  印章名称
                </label>
                <div className="text-gray-900">{record.name || "无"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  印章类型
                </label>
                <div className="text-gray-900">
                  {sealTypeMap[record.type]?.text || "无"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  当前状态
                </label>
                <div className="text-gray-900">
                  {sealStatusMap[record.status]?.text || "无"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  保管人
                </label>
                <div className="text-gray-900">{record.keeper || "无"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  联系电话
                </label>
                <div className="text-gray-900">
                  {record.keeperPhone || "无"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  存放位置
                </label>
                <div className="text-gray-900">{record.location || "无"}</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">描述</label>
              <div className="text-gray-900">{record.description || "无"}</div>
            </div>
          </div>
        ),
      });
    } catch (error) {
      console.error("显示详情时出错:", error);
      message.error("无法显示详情，请重试");
    }
  };

  // 处理编辑
  const handleEdit = (record) => {
    setEditingSeal(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      const response = await sealAPI.deleteSeal(id);
      if (response.success) {
        message.success("删除成功");
        fetchSeals();
        fetchStatistics();
      }
    } catch (error) {
      console.error("删除印章错误:", error);
      message.error("删除失败，请检查网络连接");
    }
  };

  // 处理添加新印章
  const handleAdd = () => {
    Modal.info({
      title: "提交印章申请",
      content: (
        <div>
          <p>由于系统安全要求，新增印章需要先提交申请并经过管理员审批。</p>
          <p>请前往"印章申请"页面提交新增印章申请。</p>
        </div>
      ),
      okText: "了解",
      onOk: () => {
        // 可以在这里添加跳转到印章申请页面的逻辑
        // 例如：window.location.href = '/seal-create-applications';
      },
    });
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      let response;
      if (editingSeal) {
        response = await sealAPI.updateSeal(editingSeal.id, values);
      } else {
        response = await sealAPI.createSeal(values);
      }

      if (response.success) {
        message.success(editingSeal ? "更新成功" : "添加成功");
        setIsModalVisible(false);
        fetchSeals();
        fetchStatistics();
      }
    } catch (error) {
      console.error("提交表单错误:", error);
      message.error("操作失败，请检查网络连接");
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="总印章数"
              value={statistics.total}
              valueStyle={{ color: "#3b82f6" }}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="正常使用"
              value={statistics.inUse}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="暂停使用"
              value={statistics.suspended}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="异常状态"
              value={statistics.destroyed + statistics.lost}
              valueStyle={{ color: "#ef4444" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card className="shadow-apple-lg">
        {/* 头部操作区 */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">印章列表</h2>
              <p className="text-sm text-gray-500 mt-1">管理所有印章信息</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<ReloadOutlined className="text-gray-600" />}
                onClick={() => {
                  fetchSeals();
                  fetchStatistics();
                }}
                className="hover:shadow-apple"
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined className="text-white" />}
                onClick={handleAdd}
                className="button-primary"
              >
                添加印章
              </Button>
            </div>
          </div>

          {/* 搜索和过滤区域 */}
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Search
              placeholder="搜索印章名称或保管人"
              allowClear
              enterButton={<SearchOutlined className="text-white" />}
              size="large"
              className="sm:w-80"
              onSearch={setSearchKeyword}
              onChange={(e) => !e.target.value && setSearchKeyword("")}
            />
            <Select
              placeholder="选择状态"
              allowClear
              size="large"
              className="sm:w-40"
              onChange={setStatusFilter}
            >
              {Object.entries(sealStatusMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="选择类型"
              allowClear
              size="large"
              className="sm:w-40"
              onChange={setTypeFilter}
            >
              {Object.entries(sealTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={seals}
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
          scroll={{ x: 800 }}
          className="rounded-lg overflow-hidden"
        />
      </Card>

      {/* 添加/编辑印章模态框 */}
      <Modal
        title={editingSeal ? "编辑印章" : "添加印章"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
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
                name="name"
                label="印章名称"
                rules={[{ required: true, message: "请输入印章名称" }]}
              >
                <Input placeholder="请输入印章名称" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="印章类型"
                rules={[{ required: true, message: "请选择印章类型" }]}
              >
                <Select placeholder="请选择印章类型">
                  {Object.entries(sealTypeMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="shape"
                label="印章形状"
                rules={[{ required: true, message: "请选择印章形状" }]}
              >
                <Select placeholder="请选择印章形状">
                  {Object.entries(sealShapeMap).map(([key, value]) => (
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
                label="印章状态"
                rules={[{ required: true, message: "请选择印章状态" }]}
              >
                <Select placeholder="请选择印章状态">
                  {Object.entries(sealStatusMap).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ownerDepartment"
                label="所属部门"
                rules={[{ required: true, message: "请输入所属部门" }]}
              >
                <Input placeholder="请输入所属部门" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="keeperDepartment"
                label="保管部门"
                rules={[{ required: true, message: "请输入保管部门" }]}
              >
                <Input placeholder="请输入保管部门" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="印章描述">
            <Input.TextArea
              rows={3}
              placeholder="请输入印章描述"
              className="input-apple"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="keeper"
                label="保管人"
                rules={[{ required: true, message: "请输入保管人" }]}
              >
                <Input placeholder="请输入保管人" className="input-apple" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="keeperPhone"
                label="联系电话"
                rules={[
                  { required: true, message: "请输入联系电话" },
                  { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码" },
                ]}
              >
                <Input placeholder="请输入联系电话" className="input-apple" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="存放位置"
            rules={[{ required: true, message: "请输入存放位置" }]}
          >
            <Input placeholder="请输入存放位置" className="input-apple" />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="button-primary"
              >
                {editingSeal ? "更新" : "添加"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SealList;
