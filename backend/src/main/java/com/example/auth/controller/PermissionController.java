package com.example.auth.controller;

import com.example.auth.entity.Permission;
import com.example.auth.service.PermissionService;
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
@RequestMapping("/api/permissions")
public class PermissionController {
  private final PermissionService permissionService;

  public PermissionController(PermissionService permissionService) {
    this.permissionService = permissionService;
  }

  @GetMapping
  public List<Permission> list() {
    return permissionService.list();
  }

  @GetMapping("/{id}")
  public Permission get(@PathVariable Long id) {
    return permissionService.getById(id);
  }

  @PostMapping
  public Permission create(@Valid @RequestBody Permission permission) {
    permissionService.save(permission);
    return permission;
  }

  @PostMapping("/{id}")
  public Permission update(@PathVariable Long id, @Valid @RequestBody Permission permission) {
    permission.setId(id);
    permissionService.updateById(permission);
    return permission;
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    permissionService.removeById(id);
  }
}
