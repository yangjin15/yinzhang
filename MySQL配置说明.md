# MySQL 数据库配置说明

## 📋 配置概述

本文档详细说明了印章管理系统 MySQL 数据库的配置方法，包括数据库安装、用户创建、权限设置等步骤。

## 🔧 环境要求

- **MySQL 版本**: >= 8.0
- **字符集**: utf8mb4
- **操作系统**: Windows/macOS/Linux

## 🚀 快速配置

### 1. 创建数据库

```sql
-- 创建数据库（建议数据库名）
CREATE DATABASE seal_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 验证数据库创建
SHOW DATABASES LIKE 'seal_management';
```

### 2. 创建专用用户（推荐）

```sql
-- 创建用户
CREATE USER 'seal_user'@'localhost' IDENTIFIED BY 'seal_password_123';

-- 授予权限
GRANT ALL PRIVILEGES ON seal_management.* TO 'seal_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证用户创建
SELECT User, Host FROM mysql.user WHERE User = 'seal_user';
```

### 3. 应用配置

修改 `backend/src/main/resources/application.properties` 文件：

```properties
# 数据源配置
spring.datasource.url=jdbc:mysql://localhost:3306/seal_management?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=seal_user
spring.datasource.password=seal_password_123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

# 连接池配置
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

## 🔑 详细配置选项

### 数据库连接 URL 参数说明

| 参数                    | 说明              | 推荐值           |
| ----------------------- | ----------------- | ---------------- |
| useUnicode              | 启用 Unicode 支持 | true             |
| characterEncoding       | 字符编码          | utf8mb4          |
| useSSL                  | 是否使用 SSL      | false (开发环境) |
| serverTimezone          | 服务器时区        | Asia/Shanghai    |
| allowPublicKeyRetrieval | 允许公钥检索      | true (如需要)    |

### JPA 配置选项

| 配置项                                     | 说明                 | 可选值                      |
| ------------------------------------------ | -------------------- | --------------------------- |
| spring.jpa.hibernate.ddl-auto              | 数据库表自动创建策略 | create/update/validate/none |
| spring.jpa.show-sql                        | 是否显示 SQL 语句    | true/false                  |
| spring.jpa.properties.hibernate.format_sql | 格式化 SQL 输出      | true/false                  |

### HikariCP 连接池配置

| 配置项             | 说明                 | 推荐值  |
| ------------------ | -------------------- | ------- |
| maximum-pool-size  | 最大连接数           | 20      |
| minimum-idle       | 最小空闲连接数       | 5       |
| connection-timeout | 连接超时时间(ms)     | 30000   |
| idle-timeout       | 空闲连接超时时间(ms) | 600000  |
| max-lifetime       | 连接最大生存时间(ms) | 1800000 |

## 🛠 不同环境配置

### 开发环境 (application-dev.properties)

```properties
# 开发环境配置
spring.datasource.url=jdbc:mysql://localhost:3306/seal_management_dev?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=seal_dev
spring.datasource.password=dev_password_123

# 开发环境特定配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### 生产环境 (application-prod.properties)

```properties
# 生产环境配置
spring.datasource.url=jdbc:mysql://your-prod-server:3306/seal_management?useUnicode=true&characterEncoding=utf8mb4&useSSL=true&serverTimezone=Asia/Shanghai
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# 生产环境特定配置
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.org.hibernate.SQL=WARN

# 连接池优化
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.minimum-idle=10
```

### 测试环境 (application-test.properties)

```properties
# 测试环境使用H2内存数据库
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2特定配置
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

## 🚨 安全建议

### 1. 用户权限最小化

```sql
-- 只授予必要的权限
GRANT SELECT, INSERT, UPDATE, DELETE ON seal_management.* TO 'seal_user'@'localhost';

-- 避免授予管理员权限
-- 不要使用 GRANT ALL PRIVILEGES
```

### 2. 强密码策略

```sql
-- 设置强密码
CREATE USER 'seal_user'@'localhost' IDENTIFIED BY 'Seal#2025@Strong!Pass';

-- 定期更改密码
ALTER USER 'seal_user'@'localhost' IDENTIFIED BY 'New#Strong@Password2025!';
```

### 3. 网络安全

```sql
-- 限制连接来源
CREATE USER 'seal_user'@'192.168.1.%' IDENTIFIED BY 'your_password';

-- 为不同环境创建不同用户
CREATE USER 'seal_prod'@'production-server' IDENTIFIED BY 'prod_password';
CREATE USER 'seal_dev'@'localhost' IDENTIFIED BY 'dev_password';
```

## 🔍 故障排查

### 常见问题及解决方案

#### 1. 连接被拒绝

```
错误: java.sql.SQLException: Access denied for user 'username'@'host'
```

**解决方案**:

- 检查用户名和密码是否正确
- 确认用户是否有访问权限
- 检查 MySQL 服务是否启动

#### 2. 字符集问题

```
错误: Incorrect string value
```

**解决方案**:

```sql
-- 检查数据库字符集
SHOW CREATE DATABASE seal_management;

-- 修改字符集
ALTER DATABASE seal_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. 时区问题

```
错误: The server time zone value 'CST' is unrecognized
```

**解决方案**:

- 在 URL 中添加时区参数: `&serverTimezone=Asia/Shanghai`
- 或设置 MySQL 时区: `SET GLOBAL time_zone = '+8:00';`

#### 4. SSL 连接问题

```
错误: SSL connection error
```

**解决方案**:

- 开发环境: 添加`&useSSL=false`
- 生产环境: 配置 SSL 证书

## 📊 性能优化

### 1. 索引优化

```sql
-- 为常用查询字段创建索引
CREATE INDEX idx_seal_name ON seals(name);
CREATE INDEX idx_application_status ON applications(status);
CREATE INDEX idx_application_apply_time ON applications(apply_time);

-- 复合索引
CREATE INDEX idx_seal_type_status ON seals(type, status);
```

### 2. 查询优化

```sql
-- 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM seals WHERE name LIKE '%公章%';

-- 避免全表扫描的查询
SELECT COUNT(*) FROM applications WHERE DATE(apply_time) = CURDATE();
```

### 3. 连接池调优

```properties
# 根据应用负载调整连接池大小
spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.minimum-idle=10

# 连接验证
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.validation-timeout=5000
```

## 📋 维护清单

### 日常维护

- [ ] 定期备份数据库
- [ ] 监控数据库性能
- [ ] 检查磁盘空间使用情况
- [ ] 更新数据库统计信息

### 定期维护

- [ ] 更新密码
- [ ] 清理过期数据
- [ ] 优化表结构
- [ ] 检查索引使用情况

### 备份脚本示例

```bash
#!/bin/bash
# 数据库备份脚本
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
DATABASE="seal_management"

mysqldump -u seal_user -p$PASSWORD $DATABASE > $BACKUP_DIR/seal_management_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/seal_management_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

---

**注意事项**:

- 请根据实际环境调整配置参数
- 生产环境务必使用强密码
- 定期备份数据库
- 监控数据库性能和安全状态
