import axios from "axios";

// 创建axios实例
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(
      "API请求:",
      config.method?.toUpperCase(),
      config.url,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log("API响应:", response.status, response.data);
    return response.data;
  },
  (error) => {
    console.error(
      "响应错误:",
      error.response?.status,
      error.response?.data || error.message
    );
    if (error.response?.status === 401) {
      // 处理未授权错误
      console.log("用户未授权，需要登录");
    }
    return Promise.reject(error);
  }
);

// 印章管理API
export const sealAPI = {
  // 获取印章列表
  getSeals: (params = {}) => {
    const { page = 1, size = 10, keyword, status } = params;
    return api.get("/seals", { params: { page, size, keyword, status } });
  },

  // 根据ID获取印章详情
  getSealById: (id) => {
    return api.get(`/seals/${id}`);
  },

  // 创建印章
  createSeal: (data) => {
    return api.post("/seals", data);
  },

  // 更新印章
  updateSeal: (id, data) => {
    return api.put(`/seals/${id}`, data);
  },

  // 删除印章
  deleteSeal: (id) => {
    return api.delete(`/seals/${id}`);
  },

  // 更新印章状态
  updateSealStatus: (id, status) => {
    return api.patch(`/seals/${id}/status`, { status });
  },

  // 根据保管人查询印章
  getSealsByKeeper: (keeper) => {
    return api.get(`/seals/keeper/${keeper}`);
  },

  // 获取印章统计信息
  getSealStatistics: () => {
    return api.get("/seals/statistics");
  },

  // 获取印章类型枚举
  getSealTypes: () => {
    return api.get("/seals/types");
  },

  // 获取印章状态枚举
  getSealStatuses: () => {
    return api.get("/seals/statuses");
  },
};

// 系统管理API
export const systemAPI = {
  // 健康检查
  healthCheck: () => {
    return api.get("/system/health");
  },

  // 获取系统信息
  getSystemInfo: () => {
    return api.get("/system/info");
  },
};

export default api;
