# 印章管理系统 API 接口文档

## 📋 接口概述

本文档详细描述了印章管理系统的所有后端 API 接口，包括请求方式、参数、响应格式等详细信息。

**基础信息**

- 基础 URL: `http://localhost:8080/api`
- 数据格式: JSON
- 字符编码: UTF-8
- 认证方式: JWT Token (后续实现)

## 🔐 统一响应格式

所有接口统一使用以下响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2025-06-29T15:30:45.123Z"
}
```

**响应状态码说明**

- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误

## 📝 接口列表

### 1. 系统管理

#### 1.1 系统状态检查

- **接口地址**: `GET /api/system/health`
- **接口描述**: 检查系统运行状态
- **请求方式**: GET
- **请求参数**: 无
- **请求示例**:
  ```
  GET /api/system/health
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "系统运行正常",
    "data": {
      "status": "UP",
      "version": "1.0.0",
      "database": "Connected"
    },
    "timestamp": "2025-06-29T15:30:45.123Z"
  }
  ```

### 2. 用户管理

#### 2.1 用户登录

- **接口地址**: `POST /api/auth/login`
- **接口描述**: 用户登录获取访问令牌
- **请求方式**: POST
- **请求参数**:
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | username | String | 是 | 用户名 |
  | password | String | 是 | 密码 |
- **请求示例**:
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "userInfo": {
        "id": 1,
        "username": "admin",
        "name": "管理员",
        "role": "ADMIN"
      }
    },
    "timestamp": "2025-06-29T15:30:45.123Z"
  }
  ```

#### 2.2 用户注销

- **接口地址**: `POST /api/auth/logout`
- **接口描述**: 用户注销登录
- **请求方式**: POST
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "注销成功",
    "data": null,
    "timestamp": "2025-06-29T15:30:45.123Z"
  }
  ```

### 3. 印章管理

#### 3.1 获取印章列表

- **接口地址**: `GET /api/seals`
- **接口描述**: 分页获取印章列表
- **请求方式**: GET
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 说明 | 默认值 |
  |--------|------|------|------|--------|
  | page | Integer | 否 | 页码 | 1 |
  | size | Integer | 否 | 每页数量 | 10 |
  | keyword | String | 否 | 搜索关键字 | - |
  | status | String | 否 | 印章状态 | - |
- **请求示例**:
  ```
  GET /api/seals?page=1&size=10&keyword=公章&status=ACTIVE
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 50,
      "page": 1,
      "size": 10,
      "list": [
        {
          "id": 1,
          "name": "公司公章",
          "type": "OFFICIAL",
          "status": "ACTIVE",
          "description": "用于公司对外文件盖章",
          "imageUrl": "/uploads/seals/seal_001.png",
          "createTime": "2025-06-29T10:00:00.000Z",
          "updateTime": "2025-06-29T15:30:45.123Z"
        }
      ]
    },
    "timestamp": "2025-06-29T15:30:45.123Z"
  }
  ```

#### 3.2 获取印章详情

- **接口地址**: `GET /api/seals/{id}`
- **接口描述**: 根据 ID 获取印章详细信息
- **请求方式**: GET
- **请求头**: `Authorization: Bearer {token}`
- **路径参数**:
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | id | Long | 是 | 印章 ID |
- **请求示例**:
  ```
  GET /api/seals/1
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": 1,
      "name": "公司公章",
      "type": "OFFICIAL",
      "status": "ACTIVE",
      "description": "用于公司对外文件盖章",
      "imageUrl": "/uploads/seals/seal_001.png",
      "keeper": "张三",
      "keeperPhone": "13800138000",
      "location": "行政部办公室",
      "createTime": "2025-06-29T10:00:00.000Z",
      "updateTime": "2025-06-29T15:30:45.123Z"
    },
    "timestamp": "2025-06-29T15:30:45.123Z"
  }
  ```

#### 3.3 添加印章

- **接口地址**: `POST /api/seals`
- **接口描述**: 添加新的印章信息
- **请求方式**: POST
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | name | String | 是 | 印章名称 |
  | type | String | 是 | 印章类型 (OFFICIAL/FINANCE/CONTRACT/PERSONAL) |
  | description | String | 否 | 印章描述 |
  | keeper | String | 是 | 保管人 |
  | keeperPhone | String | 是 | 保管人电话 |
  | location | String | 是 | 存放位置 |
- **请求示例**:
  ```json
  {
    "name": "财务专用章",
    "type": "FINANCE",
    "description": "用于财务相关文件盖章",
    "keeper": "李四",
    "keeperPhone": "13900139000",
    "location": "财务部办公室"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": 2,
      "name": "财务专用章",
      "type": "FINANCE",
      "status": "ACTIVE",
      "description": "用于财务相关文件盖章",
      "keeper": "李四",
      "keeperPhone": "13900139000",
      "location": "财务部办公室",
      "createTime": "2025-06-29T15:30:45.123Z",
      "updateTime": "2025-06-29T15:30:45.123Z"
    },
    "timestamp": "2025-06-29T15:30:45.123Z"
  }
  ```

### 4. 用印申请管理

#### 4.1 获取用印申请列表

- **接口地址**: `GET /api/applications`
- **接口描述**: 分页获取用印申请列表
- **请求方式**: GET
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 说明 | 默认值 |
  |--------|------|------|------|--------|
  | page | Integer | 否 | 页码 | 1 |
  | size | Integer | 否 | 每页数量 | 10 |
  | status | String | 否 | 申请状态 | - |
  | applicant | String | 否 | 申请人 | - |
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 25,
      "page": 1,
      "size": 10,
      "list": [
        {
          "id": 1,
          "applicant": "王五",
          "department": "销售部",
          "sealName": "公司公章",
          "purpose": "合同盖章",
          "status": "PENDING",
          "applyTime": "2025-06-29T14:00:00.000Z",
          "urgency": "NORMAL"
        }
      ]
    },
    "timestamp": "2025-06-29T15:30:45.123Z"
  }
  ```

#### 4.2 提交用印申请

- **接口地址**: `POST /api/applications`
- **接口描述**: 提交新的用印申请
- **请求方式**: POST
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 说明 |
  |--------|------|------|------|
  | sealId | Long | 是 | 印章 ID |
  | purpose | String | 是 | 用印目的 |
  | urgency | String | 是 | 紧急程度 (LOW/NORMAL/HIGH/URGENT) |
  | expectedTime | String | 是 | 预期用印时间 (ISO 格式) |
  | description | String | 否 | 详细说明 |
- **请求示例**:
  ```json
  {
    "sealId": 1,
    "purpose": "销售合同盖章",
    "urgency": "NORMAL",
    "expectedTime": "2025-06-30T09:00:00.000Z",
    "description": "与ABC公司签订销售合同，需要盖公章"
  }
  ```

## 📊 数据字典

### 印章类型 (SealType)

- `OFFICIAL`: 公章
- `FINANCE`: 财务章
- `CONTRACT`: 合同章
- `PERSONAL`: 个人印章

### 印章状态 (SealStatus)

- `ACTIVE`: 正常使用
- `INACTIVE`: 暂停使用
- `DAMAGED`: 损坏
- `LOST`: 遗失

### 申请状态 (ApplicationStatus)

- `PENDING`: 待审批
- `APPROVED`: 已批准
- `REJECTED`: 已拒绝
- `COMPLETED`: 已完成
- `CANCELLED`: 已取消

### 紧急程度 (Urgency)

- `LOW`: 低
- `NORMAL`: 一般
- `HIGH`: 高
- `URGENT`: 紧急

## 📚 错误码说明

| 错误码 | 说明                 |
| ------ | -------------------- |
| 10001  | 用户名或密码错误     |
| 10002  | 用户不存在           |
| 10003  | 用户已被禁用         |
| 20001  | 印章不存在           |
| 20002  | 印章已被禁用         |
| 30001  | 申请不存在           |
| 30002  | 申请状态不允许此操作 |
| 40001  | 参数验证失败         |
| 50001  | 系统内部错误         |

## 🔄 版本历史

| 版本  | 日期       | 说明                       |
| ----- | ---------- | -------------------------- |
| 1.0.0 | 2025-06-29 | 初始版本，定义基础接口结构 |

---

**备注**:

- 本文档随开发进度持续更新
- 所有时间格式均使用 ISO 8601 格式
- 分页从 1 开始计数
- 所有接口都需要进行身份验证（除登录接口外）
