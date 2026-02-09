package com.example.auth.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.auth.entity.Role;
import com.example.auth.entity.RolePermission;
import com.example.auth.service.RolePermissionService;
import com.example.auth.service.RoleService;
import jakarta.validation.Valid;
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

  public RoleController(RoleService roleService, RolePermissionService rolePermissionService) {
    this.roleService = roleService;
    this.rolePermissionService = rolePermissionService;
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

  @PostMapping("/assign-permissions")
  public void assignPermissions(@Valid @RequestBody PermissionAssignmentRequest request) {
    rolePermissionService.remove(new QueryWrapper<RolePermission>().eq("role_id", request.roleId()));
    List<RolePermission> mappings = request.permissionIds().stream()
        .map(permissionId -> {
          RolePermission mapping = new RolePermission();
          mapping.setRoleId(request.roleId());
          mapping.setPermissionId(permissionId);
          return mapping;
        })
        .toList();
    rolePermissionService.saveBatch(mappings);
  }

  public record PermissionAssignmentRequest(Long roleId, List<Long> permissionIds) {
  }
}
