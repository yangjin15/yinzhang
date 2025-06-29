# 印章管理系统

一个基于 React + Spring Boot 的现代化印章管理系统，用于企业和组织的印章使用申请、审批和管理。

## 🎯 项目概述

印章管理系统是一个全栈 Web 应用，旨在帮助企业和组织数字化管理印章的使用流程，包括印章信息管理、用印申请、审批流程、使用记录等功能。

### 主要功能

- 🏢 **印章管理**: 印章信息录入、编辑、状态管理
- 📝 **用印申请**: 在线提交用印申请，支持多种紧急程度
- ✅ **审批流程**: 灵活的审批工作流，支持多级审批
- 📊 **统计分析**: 用印数据统计和分析报表
- 👥 **用户管理**: 用户角色权限管理
- 🔒 **安全认证**: JWT 身份认证和权限控制

## 🛠 技术栈

### 前端技术

- **框架**: React 18
- **语言**: JavaScript (JSX)
- **样式**: Tailwind CSS
- **UI 组件**: Ant Design
- **构建工具**: Vite
- **开发环境**: VS Code

### 后端技术

- **框架**: Spring Boot 3.5.3
- **语言**: Java 17
- **数据库**: MySQL 8.0
- **ORM**: Spring Data JPA
- **安全**: Spring Security
- **构建工具**: Maven
- **开发环境**: IntelliJ IDEA

### 开发工具

- **版本控制**: Git
- **代码托管**: GitHub
- **API 文档**: 自定义 Markdown 文档

## 📋 设计规范

### 前端规范

- 使用 JSX 语法进行开发
- 样式优先使用 Tailwind CSS
- 特殊样式需求时创建独立 CSS 文件，禁止在 JSX 中直接写 style
- UI 组件统一使用 Ant Design
- 设计风格遵循 Apple 公司的简洁现代化设计理念
- 所有数据通过后端 API 获取，不允许硬编码

### 后端规范

- 使用 Spring Boot 最佳实践
- 所有 API 接口必须编写详细文档
- 数据库操作使用 JPA 规范
- 统一的异常处理和响应格式
- 完善的单元测试覆盖

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 16.0.0
- **Java**: >= 17
- **MySQL**: >= 8.0
- **Maven**: >= 3.6.0

### 安装步骤

1. **克隆项目**

   ```bash
   git clone https://github.com/yangjin15/yinzhang.git
   cd yinzhang
   ```

2. **数据库配置**

   创建 MySQL 数据库：

   ```sql
   CREATE DATABASE seal_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   修改后端配置文件 `backend/src/main/resources/application.properties`：

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/seal_management
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **启动后端服务**

   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

   后端服务将在 http://localhost:8080 启动

4. **启动前端应用**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   前端应用将在 http://localhost:3000 启动

### 数据库配置详情

请参考以下 MySQL 配置：

```sql
-- 创建数据库
CREATE DATABASE seal_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'seal_user'@'localhost' IDENTIFIED BY 'seal_password_123';
GRANT ALL PRIVILEGES ON seal_management.* TO 'seal_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📁 项目结构

```
yinzhang/
├── frontend/                 # 前端React应用
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── utils/          # 工具函数
│   │   └── styles/         # 样式文件
│   ├── public/             # 静态资源
│   └── package.json
├── backend/                 # 后端Spring Boot应用
│   ├── src/main/java/      # Java源码
│   │   └── com/example/backend/
│   │       ├── controller/ # 控制器
│   │       ├── service/    # 服务层
│   │       ├── entity/     # 实体类
│   │       └── repository/ # 数据访问层
│   ├── src/main/resources/ # 配置文件
│   └── pom.xml
├── API接口文档.md           # API接口文档
├── 开发日志.md             # 开发过程记录
└── README.md               # 项目说明文档
```

## 📚 文档

- [API 接口文档](./API接口文档.md) - 详细的后端 API 接口说明
- [开发日志](./开发日志.md) - 开发过程记录和问题解决方案

## 🔧 开发配置

### VS Code 配置（前端）

推荐安装以下插件：

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### IntelliJ IDEA 配置（后端）

推荐配置：

1. 确保 Project SDK 设置为 Java 17
2. 启用 Maven 自动导入
3. 安装 Spring Boot 插件
4. 配置代码格式化规则

## 🌟 功能特性

- ✨ **现代化 UI**: 基于 Ant Design 的简洁优雅界面
- 🚀 **响应式设计**: 完美适配各种设备屏幕
- 🔐 **安全认证**: JWT token 身份验证
- 📱 **移动友好**: 支持移动端访问
- 🎨 **主题定制**: 支持深色/浅色主题切换
- 📊 **数据可视化**: 丰富的图表展示
- 🔍 **全文搜索**: 强大的搜索功能
- 📝 **操作日志**: 详细的操作记录

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目地址: https://github.com/yangjin15/yinzhang
- 问题反馈: [GitHub Issues](https://github.com/yangjin15/yinzhang/issues)

## 🎉 更新日志

### v1.0.0 (2025-06-29)

- 🎉 项目初始化
- ✅ 完成基础架构搭建
- �� 创建项目文档
- 🔧 配置开发环境
