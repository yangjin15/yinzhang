import axios from "axios";
import { message } from "antd";

// 创建axios实例
const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加认证头
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理响应和错误
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    // 如果有success字段，直接返回数据
    if (data.hasOwnProperty("success")) {
      return data;
    }
    // 如果是2xx状态码，认为是成功的
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: data.message || "操作成功",
        data: data.data || data,
        code: response.status,
      };
    }
    return data;
  },
  (error) => {
    // 处理HTTP错误状态码
    const response = error.response;
    if (response) {
      const data = response.data;
      const errorMessage = data?.message || `请求失败 (${response.status})`;

      // 显示错误信息
      message.error(errorMessage);

      // 401未授权，重定向到登录页
      if (response.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      // 返回错误响应格式
      return Promise.resolve({
        success: false,
        message: errorMessage,
        data: data?.data || null,
        code: response.status,
      });
    } else {
      // 网络错误或其他错误
      const errorMessage = "网络连接失败，请检查网络设置";
      message.error(errorMessage);
      return Promise.resolve({
        success: false,
        message: errorMessage,
        data: null,
        code: -1,
      });
    }
  }
);

// 用户相关API
export const userAPI = {
  // 获取用户列表
  getUsers: (params) => api.get("/api/users", { params }),

  // 根据ID获取用户
  getUserById: (id) => api.get(`/api/users/${id}`),

  // 创建用户
  createUser: (userData) => api.post("/api/users", userData),

  // 更新用户
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),

  // 删除用户
  deleteUser: (id) => api.delete(`/api/users/${id}`),

  // 更新用户状态
  updateUserStatus: (id, status) =>
    api.patch(`/api/users/${id}/status`, { status }),

  // 更改用户角色
  updateUserRole: (id, role) => api.patch(`/api/users/${id}/role`, { role }),

  // 修改密码
  changePassword: (id, oldPassword, newPassword) =>
    api.patch(`/api/users/${id}/password`, { oldPassword, newPassword }),

  // 重置密码
  resetPassword: (id, newPassword) =>
    api.patch(`/api/users/${id}/reset-password`, { newPassword }),

  // 获取用户统计信息
  getUserStatistics: () => api.get("/api/users/statistics"),

  // 检查用户名是否存在
  checkUsername: (username) =>
    api.get(`/api/users/check-username?username=${username}`),

  // 检查邮箱是否存在
  checkEmail: (email) => api.get(`/api/users/check-email?email=${email}`),

  // 批量删除用户
  batchDeleteUsers: (ids) => api.delete("/api/users/batch", { data: { ids } }),
};

// 印章相关API
export const sealAPI = {
  // 获取印章列表
  getSeals: (params) => api.get("/api/seals", { params }),

  // 根据ID获取印章
  getSealById: (id) => api.get(`/api/seals/${id}`),

  // 创建印章
  createSeal: (sealData) => api.post("/api/seals", sealData),

  // 更新印章
  updateSeal: (id, sealData) => api.put(`/api/seals/${id}`, sealData),

  // 删除印章
  deleteSeal: (id) => api.delete(`/api/seals/${id}`),

  // 更新印章状态
  updateSealStatus: (id, status) =>
    api.patch(`/api/seals/${id}/status`, { status }),

  // 根据保管人获取印章
  getSealsByKeeper: (keeper) => api.get(`/api/seals/keeper/${keeper}`),

  // 获取印章统计信息
  getSealStatistics: () => api.get("/api/seals/statistics"),

  // 获取印章类型枚举
  getSealTypes: () => api.get("/api/seals/types"),

  // 获取印章状态枚举
  getSealStatuses: () => api.get("/api/seals/statuses"),
};

// 申请相关API
export const applicationAPI = {
  // 获取申请列表
  getApplications: (params) => api.get("/api/applications", { params }),

  // 根据ID获取申请
  getApplicationById: (id) => api.get(`/api/applications/${id}`),

  // 根据申请编号获取申请
  getApplicationByNo: (applicationNo) =>
    api.get(`/api/applications/no/${applicationNo}`),

  // 创建申请
  createApplication: (applicationData) =>
    api.post("/api/applications", applicationData),

  // 更新申请
  updateApplication: (id, applicationData) =>
    api.put(`/api/applications/${id}`, applicationData),

  // 删除申请
  deleteApplication: (id) => api.delete(`/api/applications/${id}`),

  // 获取我的申请
  getMyApplications: (applicant, params) =>
    api.get(`/api/applications/my/${applicant}`, { params }),

  // 获取待审批申请
  getPendingApplications: (params) =>
    api.get("/api/applications/pending", { params }),

  // 获取已完成申请
  getCompletedApplications: (params) =>
    api.get("/api/applications/completed", { params }),

  // 审批申请
  approveApplication: (id, status, approver, remark) =>
    api.post(`/api/applications/${id}/approve`, { status, approver, remark }),

  // 完成申请
  completeApplication: (id) => api.post(`/api/applications/${id}/complete`),

  // 撤回申请
  withdrawApplication: (id, applicant) =>
    api.post(`/api/applications/${id}/withdraw`, { applicant }),

  // 批量审批申请
  batchApproveApplications: (ids, status, approver, remark) =>
    api.post("/api/applications/batch-approve", {
      ids,
      status,
      approver,
      remark,
    }),

  // 获取申请统计信息
  getApplicationStatistics: () => api.get("/api/applications/statistics"),

  // 获取部门申请统计
  getDepartmentStatistics: () =>
    api.get("/api/applications/statistics/department"),

  // 获取印章使用统计
  getSealUsageStatistics: () =>
    api.get("/api/applications/statistics/seal-usage"),

  // 获取月度趋势统计
  getMonthlyTrend: (months = 6) =>
    api.get(`/api/applications/statistics/monthly-trend?months=${months}`),

  // 获取平均处理时间
  getAverageProcessingTime: () =>
    api.get("/api/applications/statistics/average-processing-time"),

  // 获取即将到期的申请
  getUpcomingApplications: (hours = 24) =>
    api.get(`/api/applications/upcoming?hours=${hours}`),

  // 检查申请是否可编辑
  canEditApplication: (id, applicant) =>
    api.get(`/api/applications/${id}/can-edit?applicant=${applicant}`),

  // 检查申请是否可审批
  canApproveApplication: (id) => api.get(`/api/applications/${id}/can-approve`),
};

// 认证相关API
export const authAPI = {
  // 用户登录
  login: (username, password) =>
    api.post("/api/auth/login", { username, password }),

  // 用户注册
  register: (userData) => api.post("/api/auth/register", userData),

  // 用户登出
  logout: () => api.post("/api/auth/logout"),

  // 获取当前用户信息
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("获取当前用户失败:", error);
      return null;
    }
  },

  // 刷新令牌
  refreshToken: () => api.post("/api/auth/refresh"),
};

export default api;
