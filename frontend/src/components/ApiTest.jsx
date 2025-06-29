import React, { useState } from "react";
import { Card, Button, Space, message, Divider } from "antd";
import { systemAPI, sealAPI } from "../services/api";

const ApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testAPI = async (name, apiCall) => {
    setLoading(true);
    try {
      const result = await apiCall();
      setResults((prev) => ({
        ...prev,
        [name]: { success: true, data: result },
      }));
      message.success(`${name} 测试成功`);
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: { success: false, error: error.message },
      }));
      message.error(`${name} 测试失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: "健康检查",
      call: () => systemAPI.healthCheck(),
    },
    {
      name: "系统信息",
      call: () => systemAPI.getSystemInfo(),
    },
    {
      name: "印章列表",
      call: () => sealAPI.getSeals({ page: 1, size: 5 }),
    },
    {
      name: "印章统计",
      call: () => sealAPI.getSealStatistics(),
    },
    {
      name: "印章类型",
      call: () => sealAPI.getSealTypes(),
    },
  ];

  return (
    <Card title="API连接测试" className="shadow-apple-lg">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          点击下面的按钮测试前端与后端API的连接状态
        </div>

        <Space wrap>
          {tests.map((test) => (
            <Button
              key={test.name}
              onClick={() => testAPI(test.name, test.call)}
              loading={loading}
              type="primary"
            >
              测试 {test.name}
            </Button>
          ))}
        </Space>

        <Button
          onClick={async () => {
            for (const test of tests) {
              await testAPI(test.name, test.call);
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }}
          loading={loading}
          type="default"
          size="large"
        >
          运行所有测试
        </Button>

        <Divider />

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">测试结果：</h3>
          {Object.entries(results).map(([name, result]) => (
            <div key={name} className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{name}:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    result.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.success ? "成功" : "失败"}
                </span>
              </div>
              {result.success ? (
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              ) : (
                <div className="mt-2 text-red-600 text-sm">
                  错误: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ApiTest;
