import React from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import MainLayout from "./components/Layout/MainLayout";
import SealList from "./pages/SealList";
import "./App.css";

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
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <div className="App">
        <MainLayout>
          <SealList />
        </MainLayout>
      </div>
    </ConfigProvider>
  );
}

export default App;
