package com.example.auth.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.auth.entity.Role;
import com.example.auth.entity.RoleMenu;
import com.example.auth.entity.RolePermission;
import com.example.auth.service.RoleMenuService;
import com.example.auth.service.RolePermissionService;
import com.example.auth.service.RoleService;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
  private final RoleService roleService;
  private final RolePermissionService rolePermissionService;
  private final RoleMenuService roleMenuService;

  public RoleController(RoleService roleService, RolePermissionService rolePermissionService, RoleMenuService roleMenuService) {
    this.roleService = roleService;
    this.rolePermissionService = rolePermissionService;
    this.roleMenuService = roleMenuService;
  }

  @GetMapping
  public List<Role> list() {
    return roleService.list();
  }

  @GetMapping("/{id}")
  public Role get(@PathVariable Long id) {
    return roleService.getById(id);
  }

  @PostMapping
  public Role create(@Valid @RequestBody Role role) {
    roleService.save(role);
    return role;
  }

  @PostMapping("/{id}")
  public Role update(@PathVariable Long id, @Valid @RequestBody Role role) {
    role.setId(id);
    roleService.updateById(role);
    return role;
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    roleService.removeById(id);
  }

  @GetMapping("/{id}/permissions")
  public List<Long> rolePermissions(@PathVariable Long id) {
    List<RolePermission> mappings = rolePermissionService.lambdaQuery().eq(RolePermission::getRoleId, id).list();
    if (mappings.isEmpty()) return Collections.emptyList();
    return mappings.stream().map(RolePermission::getPermissionId).toList();
  }

  @GetMapping("/{id}/menus")
  public List<Long> roleMenus(@PathVariable Long id) {
    List<RoleMenu> mappings = roleMenuService.lambdaQuery().eq(RoleMenu::getRoleId, id).list();
    if (mappings.isEmpty()) return Collections.emptyList();
    return mappings.stream().map(RoleMenu::getMenuId).toList();
  }

  @PostMapping("/assign-permissions")
  public void assignPermissions(@Valid @RequestBody PermissionAssignmentRequest request) {
    rolePermissionService.remove(new QueryWrapper<RolePermission>().eq("role_id", request.roleId()));
    if (request.permissionIds() == null || request.permissionIds().isEmpty()) return;
    List<RolePermission> mappings = request.permissionIds().stream().map(permissionId -> {
      RolePermission mapping = new RolePermission();
      mapping.setRoleId(request.roleId());
      mapping.setPermissionId(permissionId);
      return mapping;
    }).toList();
    rolePermissionService.saveBatch(mappings);
  }

  @PostMapping("/assign-menus")
  public void assignMenus(@Valid @RequestBody MenuAssignmentRequest request) {
    roleMenuService.remove(new QueryWrapper<RoleMenu>().eq("role_id", request.roleId()));
    if (request.menuIds() == null || request.menuIds().isEmpty()) return;
    List<RoleMenu> mappings = request.menuIds().stream().map(menuId -> {
      RoleMenu mapping = new RoleMenu();
      mapping.setRoleId(request.roleId());
      mapping.setMenuId(menuId);
      return mapping;
    }).toList();
    roleMenuService.saveBatch(mappings);
  }

  public record PermissionAssignmentRequest(Long roleId, List<Long> permissionIds) {}

  public record MenuAssignmentRequest(Long roleId, List<Long> menuIds) {}
}
