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
    active: 0,
    inactive: 0,
    damaged: 0,
    lost: 0,
  });
  const [form] = Form.useForm();

  // 印章类型映射
  const sealTypeMap = {
    OFFICIAL: { text: "公章", color: "blue" },
    FINANCE: { text: "财务章", color: "green" },
    CONTRACT: { text: "合同章", color: "orange" },
    PERSONAL: { text: "个人印章", color: "purple" },
  };

  // 印章状态映射
  const sealStatusMap = {
    ACTIVE: { text: "正常使用", color: "success" },
    INACTIVE: { text: "暂停使用", color: "warning" },
    DAMAGED: { text: "损坏", color: "error" },
    LOST: { text: "遗失", color: "default" },
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

      if (response.code === 200) {
        setSeals(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.message || "获取印章列表失败");
      }
    } catch (error) {
      console.error("获取印章列表错误:", error);
      message.error("获取印章列表失败，请检查网络连接");
      // 如果API调用失败，使用模拟数据作为后备
      const mockData = [
        {
          id: 1,
          name: "公司公章",
          type: "OFFICIAL",
          status: "ACTIVE",
          description: "用于公司对外文件盖章",
          keeper: "张三",
          keeperPhone: "13800138000",
          location: "行政部办公室",
          createTime: "2025-01-15T10:00:00",
          updateTime: "2025-06-29T15:30:45",
        },
        {
          id: 2,
          name: "财务专用章",
          type: "FINANCE",
          status: "ACTIVE",
          description: "用于财务相关文件盖章",
          keeper: "李四",
          keeperPhone: "13900139000",
          location: "财务部办公室",
          createTime: "2025-02-01T14:30:00",
          updateTime: "2025-06-28T09:15:20",
        },
        {
          id: 3,
          name: "合同专用章",
          type: "CONTRACT",
          status: "INACTIVE",
          description: "用于合同签署",
          keeper: "王五",
          keeperPhone: "13700137000",
          location: "法务部办公室",
          createTime: "2025-03-10T16:45:00",
          updateTime: "2025-06-25T11:20:15",
        },
      ];
      setSeals(mockData);
      setTotal(mockData.length);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchKeyword, statusFilter, typeFilter]);

  // 获取统计信息
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await sealAPI.getSealStatistics();
      if (response.code === 200) {
        const stats = response.data;
        setStatistics({
          total: stats.total || 0,
          active: stats.byStatus?.ACTIVE || 0,
          inactive: stats.byStatus?.INACTIVE || 0,
          damaged: stats.byStatus?.DAMAGED || 0,
          lost: stats.byStatus?.LOST || 0,
        });
      }
    } catch (error) {
      console.error("获取统计信息错误:", error);
      // 使用模拟统计数据
      setStatistics({
        total: 12,
        active: 8,
        inactive: 2,
        damaged: 1,
        lost: 1,
      });
    }
  }, []);

  useEffect(() => {
    fetchSeals();
    fetchStatistics();
  }, [fetchSeals, fetchStatistics]);

  // 表格列定义
  const columns = [
    {
      title: "印章信息",
      key: "sealInfo",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <SafetyOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Tag color={sealTypeMap[record.type]?.color}>
                {sealTypeMap[record.type]?.text}
              </Tag>
              <Tag color={sealStatusMap[record.status]?.color}>
                {sealStatusMap[record.status]?.text}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "保管信息",
      key: "keeperInfo",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <UserOutlined className="text-gray-400" />
            <span className="text-sm font-medium">{record.keeper}</span>
          </div>
          <div className="flex items-center space-x-2">
            <PhoneOutlined className="text-gray-400" />
            <span className="text-sm text-gray-600">{record.keeperPhone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <EnvironmentOutlined className="text-gray-400" />
            <span className="text-sm text-gray-600">{record.location}</span>
          </div>
        </div>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 120,
      render: (time) => (
        <div className="text-sm text-gray-600">
          {new Date(time).toLocaleDateString()}
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
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              className="hover:bg-blue-50 hover:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
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
                icon={<DeleteOutlined />}
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
              <div className="text-gray-900">{record.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                印章类型
              </label>
              <div className="text-gray-900">
                {sealTypeMap[record.type]?.text}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                当前状态
              </label>
              <div className="text-gray-900">
                {sealStatusMap[record.status]?.text}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                保管人
              </label>
              <div className="text-gray-900">{record.keeper}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                联系电话
              </label>
              <div className="text-gray-900">{record.keeperPhone}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                存放位置
              </label>
              <div className="text-gray-900">{record.location}</div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">描述</label>
            <div className="text-gray-900">{record.description}</div>
          </div>
        </div>
      ),
    });
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
      if (response.code === 200) {
        message.success("删除成功");
        fetchSeals();
        fetchStatistics();
      } else {
        message.error(response.message || "删除失败");
      }
    } catch (error) {
      console.error("删除印章错误:", error);
      message.error("删除失败，请检查网络连接");
    }
  };

  // 处理添加新印章
  const handleAdd = () => {
    setEditingSeal(null);
    form.resetFields();
    setIsModalVisible(true);
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

      if (response.code === 200) {
        message.success(editingSeal ? "更新成功" : "添加成功");
        setIsModalVisible(false);
        fetchSeals();
        fetchStatistics();
      } else {
        message.error(response.message || "操作失败");
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
              value={statistics.active}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="暂停使用"
              value={statistics.inactive}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center hover:shadow-apple-lg transition-shadow">
            <Statistic
              title="异常状态"
              value={statistics.damaged + statistics.lost}
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
                icon={<ReloadOutlined />}
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
                icon={<PlusOutlined />}
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
              enterButton={<SearchOutlined />}
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
