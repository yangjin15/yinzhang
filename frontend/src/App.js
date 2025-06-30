import React, { useState, useEffect } from "react";
import { ConfigProvider, message } from "antd";
import zhCN from "antd/locale/zh_CN";
import MainLayout from "./components/Layout/MainLayout";
import SealList from "./pages/SealList";
import SealApplications from "./pages/SealApplications";
import Statistics from "./pages/Statistics";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./index.css";

// Ant Design 主题配置
const theme = {
  token: {
    colorPrimary: "#3b82f6",
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: "#f9fafb",
      headerBg: "#ffffff",
      siderBg: "#ffffff",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#eff6ff",
      itemSelectedColor: "#2563eb",
      itemHoverBg: "#f3f4f6",
    },
    Card: {
      borderRadiusLG: 16,
    },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Table: {
      borderRadiusLG: 12,
    },
  },
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState("login"); // login, register, app
  const [currentPage, setCurrentPage] = useState("1-1"); // 默认显示印章列表
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 检查本地存储中的登录状态
    const storedUserInfo = localStorage.getItem("user");
    const auth = localStorage.getItem("auth");

    if (storedUserInfo && auth) {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsLoggedIn(true);
      setCurrentView("app");
    }
  }, []);

  const handleLogin = (userData) => {
    console.log("App handleLogin called with userData:", userData); // 添加调试信息

    // 将用户信息保存到localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("auth", "true");

    setUserInfo(userData);
    setIsLoggedIn(true);
    setCurrentView("app");
    console.log("State updated - isLoggedIn: true, currentView: app"); // 添加调试信息
    console.log("User data saved to localStorage:", userData); // 添加调试信息
    message.success("登录成功！");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    setUserInfo(null);
    setIsLoggedIn(false);
    setCurrentView("login");
    setCurrentPage("1-1");
    message.success("退出登录成功");
  };

  const handleMenuClick = (key) => {
    setCurrentPage(key);
  };

  const handleSwitchToRegister = () => {
    setCurrentView("register");
  };

  const handleSwitchToLogin = () => {
    setCurrentView("login");
  };

  const handleRegisterSuccess = () => {
    setCurrentView("login");
    message.success("注册成功！请使用您的账号登录。");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "1-1": // 印章列表
        return <SealList />;
      case "1-2": // 添加印章（跳转到印章列表）
        return <SealList />;
      case "2-1": // 我的申请
      case "2-2": // 待审批
      case "2-3": // 已完成
        return <SealApplications />;
      case "3-1": // 使用统计
      case "3-2": // 报表中心
        return <Statistics />;
      case "4-1": // 用户列表
      case "4-2": // 角色管理
        return <UserManagement />;
      case "profile": // 个人资料
        return <Profile />;
      case "settings": // 系统设置（暂时显示开发中）
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">⚙️</div>
              <h3 className="text-xl text-gray-600">系统设置功能开发中...</h3>
              <p className="text-gray-500 mt-2">敬请期待更多功能</p>
            </div>
          </div>
        );
      default:
        return <SealList />;
    }
  };

  // 根据当前视图渲染不同的页面
  if (currentView === "register") {
    return (
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: "#3b82f6",
            borderRadius: 8,
            colorBgContainer: "#ffffff",
          },
        }}
      >
        <Register
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </ConfigProvider>
    );
  }

  // 如果未登录，显示登录页面
  if (!isLoggedIn || currentView === "login") {
    return (
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: "#3b82f6",
            borderRadius: 8,
            colorBgContainer: "#ffffff",
          },
        }}
      >
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={handleSwitchToRegister}
        />
      </ConfigProvider>
    );
  }

  // 已登录，显示主应用
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 8,
          colorBgContainer: "#ffffff",
        },
      }}
    >
      <MainLayout
        currentPage={currentPage}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
        userInfo={userInfo}
      >
        {renderPage()}
      </MainLayout>
    </ConfigProvider>
  );
}

export default App;
