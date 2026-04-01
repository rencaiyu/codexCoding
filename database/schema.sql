CREATE DATABASE IF NOT EXISTS permission_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE permission_system;

CREATE TABLE IF NOT EXISTS sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(128) NOT NULL,
  email VARCHAR(128) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_permission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  resource VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_user_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  UNIQUE KEY uniq_user_role (user_id, role_id),
  CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
  CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES sys_role (id)
);

CREATE TABLE IF NOT EXISTS sys_role_permission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  UNIQUE KEY uniq_role_permission (role_id, permission_id),
  CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id) REFERENCES sys_role (id),
  CONSTRAINT fk_role_perm_permission FOREIGN KEY (permission_id) REFERENCES sys_permission (id)
);

INSERT INTO sys_role (code, name, description)
SELECT 'ADMIN', '超级管理员', '拥有全部菜单访问权限'
WHERE NOT EXISTS (SELECT 1 FROM sys_role WHERE code = 'ADMIN');

INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'users:view', '用户菜单', '访问用户管理菜单', 'users', 'view'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'users:view');

INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'roles:view', '角色菜单', '访问角色管理菜单', 'roles', 'view'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'roles:view');

INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'permissions:view', '权限菜单', '访问权限管理菜单', 'permissions', 'view'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'permissions:view');


INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'users:create', '新增用户按钮', '用户管理下新增用户按钮权限', 'users', 'create'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'users:create');

INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'users:assign', '分配用户角色按钮', '用户管理下分配角色按钮权限', 'users', 'assign'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'users:assign');

INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'roles:create', '新增角色按钮', '角色管理下新增角色按钮权限', 'roles', 'create'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'roles:create');

INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'roles:assign', '分配角色权限按钮', '角色管理下分配权限按钮权限', 'roles', 'assign'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'roles:assign');

INSERT INTO sys_permission (code, name, description, resource, action)
SELECT 'permissions:create', '新增权限按钮', '菜单与按钮权限下新增权限按钮', 'permissions', 'create'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'permissions:create');

INSERT INTO sys_user (username, display_name, email, password_hash, enabled)
SELECT 'admin', '系统管理员', 'admin@example.com', 'admin123456', 1
WHERE NOT EXISTS (SELECT 1 FROM sys_user WHERE username = 'admin');

INSERT INTO sys_user_role (user_id, role_id)
SELECT u.id, r.id
FROM sys_user u
JOIN sys_role r ON r.code = 'ADMIN'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM sys_user_role ur WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM sys_role r
JOIN sys_permission p ON p.code IN ('users:view', 'roles:view', 'permissions:view', 'users:create', 'users:assign', 'roles:create', 'roles:assign', 'permissions:create')
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
