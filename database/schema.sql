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

CREATE TABLE IF NOT EXISTS sys_menu (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT DEFAULT NULL,
  menu_key VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  path VARCHAR(128) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES sys_menu (id)
);

CREATE TABLE IF NOT EXISTS sys_permission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  menu_id BIGINT DEFAULT NULL,
  resource VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  permission_type VARCHAR(16) NOT NULL DEFAULT 'BUTTON',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_permission_menu FOREIGN KEY (menu_id) REFERENCES sys_menu (id)
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

CREATE TABLE IF NOT EXISTS sys_role_menu (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL,
  menu_id BIGINT NOT NULL,
  UNIQUE KEY uniq_role_menu (role_id, menu_id),
  CONSTRAINT fk_role_menu_role FOREIGN KEY (role_id) REFERENCES sys_role (id),
  CONSTRAINT fk_role_menu_menu FOREIGN KEY (menu_id) REFERENCES sys_menu (id)
);

INSERT INTO sys_role (code, name, description)
SELECT 'ADMIN', '超级管理员', '拥有全部菜单访问权限'
WHERE NOT EXISTS (SELECT 1 FROM sys_role WHERE code = 'ADMIN');

INSERT INTO sys_menu (parent_id, menu_key, name, path, sort_order)
SELECT NULL, 'users', '用户管理', '/users', 1
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_key = 'users');

INSERT INTO sys_menu (parent_id, menu_key, name, path, sort_order)
SELECT NULL, 'roles', '角色管理', '/roles', 2
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_key = 'roles');

INSERT INTO sys_menu (parent_id, menu_key, name, path, sort_order)
SELECT NULL, 'menus', '菜单管理', '/menus', 3
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_key = 'menus');

INSERT INTO sys_menu (parent_id, menu_key, name, path, sort_order)
SELECT NULL, 'permissions', '按钮权限管理', '/permissions', 4
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_key = 'permissions');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'users:menu', '用户菜单', '用户管理菜单访问', m.id, 'users', 'menu', 'MENU' FROM sys_menu m
WHERE m.menu_key='users' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='users:menu');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'roles:menu', '角色菜单', '角色管理菜单访问', m.id, 'roles', 'menu', 'MENU' FROM sys_menu m
WHERE m.menu_key='roles' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='roles:menu');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'menus:menu', '菜单管理菜单', '菜单管理访问', m.id, 'menus', 'menu', 'MENU' FROM sys_menu m
WHERE m.menu_key='menus' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='menus:menu');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'permissions:menu', '权限管理菜单', '权限管理访问', m.id, 'permissions', 'menu', 'MENU' FROM sys_menu m
WHERE m.menu_key='permissions' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='permissions:menu');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'users:create', '新增用户', '用户新增按钮', m.id, 'users', 'create', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='users' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='users:create');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'users:update', '编辑用户', '用户编辑按钮', m.id, 'users', 'update', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='users' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='users:update');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'users:delete', '删除用户', '用户删除按钮', m.id, 'users', 'delete', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='users' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='users:delete');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'users:assign', '分配用户角色', '分配角色按钮', m.id, 'users', 'assign', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='users' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='users:assign');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'roles:create', '新增角色', '角色新增按钮', m.id, 'roles', 'create', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='roles' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='roles:create');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'roles:update', '编辑角色', '角色编辑按钮', m.id, 'roles', 'update', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='roles' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='roles:update');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'roles:delete', '删除角色', '角色删除按钮', m.id, 'roles', 'delete', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='roles' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='roles:delete');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'roles:assign', '分配角色按钮权限', '角色权限分配按钮', m.id, 'roles', 'assign', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='roles' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='roles:assign');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'permissions:create', '新增按钮权限', '权限新增按钮', m.id, 'permissions', 'create', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='permissions' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='permissions:create');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'permissions:update', '编辑按钮权限', '权限编辑按钮', m.id, 'permissions', 'update', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='permissions' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='permissions:update');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'permissions:delete', '删除按钮权限', '权限删除按钮', m.id, 'permissions', 'delete', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='permissions' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='permissions:delete');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'menus:create', '新增菜单', '菜单新增按钮', m.id, 'menus', 'create', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='menus' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='menus:create');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'menus:update', '编辑菜单', '菜单编辑按钮', m.id, 'menus', 'update', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='menus' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='menus:update');

INSERT INTO sys_permission (code, name, description, menu_id, resource, action, permission_type)
SELECT 'menus:delete', '删除菜单', '菜单删除按钮', m.id, 'menus', 'delete', 'BUTTON' FROM sys_menu m
WHERE m.menu_key='menus' AND NOT EXISTS (SELECT 1 FROM sys_permission WHERE code='menus:delete');

INSERT INTO sys_user (username, display_name, email, password_hash, enabled)
SELECT 'admin', '系统管理员', 'admin@example.com', 'admin123456', 1
WHERE NOT EXISTS (SELECT 1 FROM sys_user WHERE username = 'admin');

INSERT INTO sys_user_role (user_id, role_id)
SELECT u.id, r.id
FROM sys_user u
JOIN sys_role r ON r.code = 'ADMIN'
WHERE u.username = 'admin'
  AND NOT EXISTS (SELECT 1 FROM sys_user_role ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT r.id, m.id FROM sys_role r JOIN sys_menu m
WHERE r.code='ADMIN'
  AND NOT EXISTS (SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM sys_role r
JOIN sys_permission p
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM sys_role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);
