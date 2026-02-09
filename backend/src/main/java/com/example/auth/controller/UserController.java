package com.example.auth.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.auth.entity.User;
import com.example.auth.entity.UserRole;
import com.example.auth.service.UserRoleService;
import com.example.auth.service.UserService;
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
@RequestMapping("/api/users")
public class UserController {
  private final UserService userService;
  private final UserRoleService userRoleService;

  public UserController(UserService userService, UserRoleService userRoleService) {
    this.userService = userService;
    this.userRoleService = userRoleService;
  }

  @GetMapping
  public List<User> list() {
    return userService.list();
  }

  @GetMapping("/{id}")
  public User get(@PathVariable Long id) {
    return userService.getById(id);
  }

  @PostMapping
  public User create(@Valid @RequestBody User user) {
    userService.save(user);
    return user;
  }

  @PostMapping("/{id}")
  public User update(@PathVariable Long id, @Valid @RequestBody User user) {
    user.setId(id);
    userService.updateById(user);
    return user;
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    userService.removeById(id);
  }

  @PostMapping("/assign-roles")
  public void assignRoles(@Valid @RequestBody RoleAssignmentRequest request) {
    userRoleService.remove(new QueryWrapper<UserRole>().eq("user_id", request.userId()));
    List<UserRole> mappings = request.roleIds().stream()
        .map(roleId -> {
          UserRole mapping = new UserRole();
          mapping.setUserId(request.userId());
          mapping.setRoleId(roleId);
          return mapping;
        })
        .toList();
    userRoleService.saveBatch(mappings);
  }

  public record RoleAssignmentRequest(Long userId, List<Long> roleIds) {
  }
}
