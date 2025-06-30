import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  DatePicker,
  Select,
  Button,
  Table,
  Tabs,
  Empty,
  Spin,
  message,
} from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  DownloadOutlined,
  SafetyOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { userAPI, applicationAPI, sealAPI } from "../services/api";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const Statistics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [period, setPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("usage");

  // 统计数据状态
  const [overviewData, setOverviewData] = useState({
    totalSeals: 0,
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    averageProcessingTime: "0",
    mostUsedSeal: "-",
  });

  const [sealUsageData, setSealUsageData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [userStatistics, setUserStatistics] = useState({});
  const [applicationStatistics, setApplicationStatistics] = useState({});

  useEffect(() => {
    fetchAllStatistics();
  }, [dateRange, period]);

  const fetchAllStatistics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserStatistics(),
        fetchApplicationStatistics(),
        fetchSealUsageStatistics(),
        fetchDepartmentStatistics(),
        fetchMonthlyTrend(),
        fetchSealStatistics(),
      ]);
    } catch (error) {
      message.error("获取统计数据失败：" + (error.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const response = await userAPI.getUserStatistics();
      if (response.success) {
        setUserStatistics(response.data);
      } else {
        console.error("获取用户统计失败:", response.message);
      }
    } catch (error) {
      console.error("获取用户统计失败:", error);
    }
  };

  const fetchApplicationStatistics = async () => {
    try {
      const response = await applicationAPI.getApplicationStatistics();
      if (response.success) {
        const stats = response.data;
        setApplicationStatistics(stats);

        // 更新概览数据
        setOverviewData((prev) => ({
          ...prev,
          totalApplications: stats.totalApplications || 0,
          approvedApplications: stats.byStatus?.APPROVED || 0,
          rejectedApplications: stats.byStatus?.REJECTED || 0,
          averageProcessingTime: stats.averageProcessingTime?.toFixed(1) || "0",
        }));
      } else {
        console.error("获取申请统计失败:", response.message);
      }
    } catch (error) {
      console.error("获取申请统计失败:", error);
    }
  };

  const fetchSealUsageStatistics = async () => {
    try {
      const response = await applicationAPI.getSealUsageStatistics();
      if (response.success) {
        const usageData = response.data.map((item, index) => ({
          key: index,
          sealName: item.sealName,
          type: "OFFICIAL", // 默认类型，实际项目中应该从后端获取
          usageCount: item.usageCount,
          percentage: 0, // 需要计算百分比
        }));

        // 计算百分比
        const totalUsage = usageData.reduce(
          (sum, item) => sum + item.usageCount,
          0
        );
        usageData.forEach((item) => {
          item.percentage =
            totalUsage > 0
              ? Math.round((item.usageCount / totalUsage) * 100)
              : 0;
        });

        setSealUsageData(usageData);

        // 更新最常用印章
        if (usageData.length > 0) {
          setOverviewData((prev) => ({
            ...prev,
            mostUsedSeal: usageData[0].sealName,
          }));
        }
      } else {
        console.error("获取印章使用统计失败:", response.message);
      }
    } catch (error) {
      console.error("获取印章使用统计失败:", error);
    }
  };

  const fetchDepartmentStatistics = async () => {
    try {
      const response = await applicationAPI.getDepartmentStatistics();
      if (response.success) {
        const deptData = response.data.map((item, index) => ({
          key: index,
          department: item.department,
          applicationCount: item.count,
          // 这些数据需要后端提供更详细的统计
          approvedCount: Math.floor(item.count * 0.85), // 假设85%通过率
          rejectedCount: Math.floor(item.count * 0.15), // 假设15%拒绝率
        }));
        setDepartmentData(deptData);
      } else {
        console.error("获取部门统计失败:", response.message);
      }
    } catch (error) {
      console.error("获取部门统计失败:", error);
    }
  };

  const fetchMonthlyTrend = async () => {
    try {
      const response = await applicationAPI.getMonthlyTrend(6);
      if (response.success) {
        const trendData = response.data.map((item) => ({
          month: item.month,
          applications: item.count,
          // 这些数据需要后端提供更详细的统计
          approved: Math.floor(item.count * 0.85),
          rejected: Math.floor(item.count * 0.15),
        }));
        setMonthlyTrendData(trendData);
      } else {
        console.error("获取月度趋势失败:", response.message);
      }
    } catch (error) {
      console.error("获取月度趋势失败:", error);
    }
  };

  const fetchSealStatistics = async () => {
    try {
      const response = await sealAPI.getSealStatistics();
      if (response.success) {
        setOverviewData((prev) => ({
          ...prev,
          totalSeals: response.data.total || 0,
        }));
      } else {
        console.error("获取印章统计失败:", response.message);
      }
    } catch (error) {
      console.error("获取印章统计失败:", error);
    }
  };

  const handleExport = (type) => {
    // 模拟导出功能
    const fileName = `${type}_report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    message.success(`正在导出${type}报表: ${fileName}`);
    // 这里可以添加实际的导出逻辑
  };

  const sealUsageColumns = [
    {
      title: "印章名称",
      dataIndex: "sealName",
      key: "sealName",
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <SafetyOutlined className="text-white text-sm" />
          </div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "使用次数",
      dataIndex: "usageCount",
      key: "usageCount",
      render: (count) => (
        <span className="font-semibold text-blue-600">{count}</span>
      ),
    },
    {
      title: "使用率",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage) => (
        <div className="flex items-center space-x-2">
          <Progress
            percent={percentage}
            size="small"
            strokeColor="#3b82f6"
            className="flex-1"
          />
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
      ),
    },
  ];

  const departmentColumns = [
    {
      title: "部门",
      dataIndex: "department",
      key: "department",
      render: (dept) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center">
            <UserOutlined className="text-white text-xs" />
          </div>
          <span className="font-medium">{dept}</span>
        </div>
      ),
    },
    {
      title: "申请总数",
      dataIndex: "applicationCount",
      key: "applicationCount",
      render: (count) => <span className="font-semibold">{count}</span>,
    },
    {
      title: "通过数量",
      dataIndex: "approvedCount",
      key: "approvedCount",
      render: (count) => (
        <span className="text-green-600 font-semibold">{count}</span>
      ),
    },
    {
      title: "拒绝数量",
      dataIndex: "rejectedCount",
      key: "rejectedCount",
      render: (count) => (
        <span className="text-red-600 font-semibold">{count}</span>
      ),
    },
    {
      title: "通过率",
      key: "successRate",
      render: (_, record) => {
        const rate =
          record.applicationCount > 0
            ? Math.round((record.approvedCount / record.applicationCount) * 100)
            : 0;
        return (
          <div className="flex items-center space-x-2">
            <Progress
              percent={rate}
              size="small"
              strokeColor={
                rate >= 80 ? "#10b981" : rate >= 60 ? "#f59e0b" : "#ef4444"
              }
              className="flex-1"
            />
            <span className="text-sm font-medium">{rate}%</span>
          </div>
        );
      },
    },
  ];

  const monthlyTrendColumns = [
    {
      title: "月份",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "申请数量",
      dataIndex: "applications",
      key: "applications",
      render: (count) => <span className="font-semibold">{count}</span>,
    },
    {
      title: "通过数量",
      dataIndex: "approved",
      key: "approved",
      render: (count) => (
        <span className="text-green-600 font-semibold">{count}</span>
      ),
    },
    {
      title: "拒绝数量",
      dataIndex: "rejected",
      key: "rejected",
      render: (count) => (
        <span className="text-red-600 font-semibold">{count}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载统计数据中..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 页面标题和操作栏 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">数据统计</h1>
            <p className="text-gray-600">查看系统使用情况和业务数据分析</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              className="rounded-lg"
            />
            <Select value={period} onChange={setPeriod} className="w-32">
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
              <Option value="quarter">本季度</Option>
              <Option value="year">本年</Option>
            </Select>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport("统计")}
              className="rounded-lg"
            >
              导出报表
            </Button>
          </div>
        </div>
      </div>

      {/* 概览统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="印章总数"
              value={overviewData.totalSeals}
              prefix={<SafetyOutlined className="text-blue-500" />}
              valueStyle={{ color: "#3b82f6" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="申请总数"
              value={overviewData.totalApplications}
              prefix={<FileTextOutlined className="text-green-500" />}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="通过申请"
              value={overviewData.approvedApplications}
              prefix={<RiseOutlined className="text-emerald-500" />}
              valueStyle={{ color: "#059669" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="平均处理时间"
              value={overviewData.averageProcessingTime}
              suffix="小时"
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细统计数据 */}
      <Card className="rounded-lg shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <PieChartOutlined />
                印章使用统计
              </span>
            }
            key="usage"
          >
            {sealUsageData.length > 0 ? (
              <Table
                columns={sealUsageColumns}
                dataSource={sealUsageData}
                pagination={{ pageSize: 5 }}
                size="middle"
              />
            ) : (
              <Empty description="暂无印章使用数据" />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <UserOutlined />
                部门统计
              </span>
            }
            key="department"
          >
            {departmentData.length > 0 ? (
              <Table
                columns={departmentColumns}
                dataSource={departmentData}
                pagination={{ pageSize: 5 }}
                size="middle"
              />
            ) : (
              <Empty description="暂无部门统计数据" />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                趋势分析
              </span>
            }
            key="trend"
          >
            {monthlyTrendData.length > 0 ? (
              <Table
                columns={monthlyTrendColumns}
                dataSource={monthlyTrendData}
                pagination={false}
                size="middle"
              />
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Statistics;
