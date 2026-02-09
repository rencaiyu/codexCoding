# 权限管理系统

本仓库包含一个基础权限管理系统示例：

- 后端：JDK 17 + Spring Boot 3.3.5 + MyBatis-Plus 3.5.5 + MySQL
- 前端：React + Ant Design

## 数据库

建表脚本位于 `database/schema.sql`，请先在 MySQL 中执行：

```sql
SOURCE database/schema.sql;
```

## 后端启动

```bash
cd backend
mvn spring-boot:run
```

默认数据库连接信息在 `backend/src/main/resources/application.yml`，请根据实际环境修改。

## 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端默认请求 `http://localhost:8080/api`。
