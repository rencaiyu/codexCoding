package com.example.auth.controller;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.LoginResponse;
import com.example.auth.entity.Permission;
import com.example.auth.entity.RolePermission;
import com.example.auth.entity.User;
import com.example.auth.entity.UserRole;
import com.example.auth.exception.UnauthorizedException;
import com.example.auth.security.JwtTokenProvider;
import com.example.auth.service.PermissionService;
import com.example.auth.service.RolePermissionService;
import com.example.auth.service.UserRoleService;
import com.example.auth.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserService userService;
  private final UserRoleService userRoleService;
  private final RolePermissionService rolePermissionService;
  private final PermissionService permissionService;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;

  public AuthController(
      UserService userService,
      UserRoleService userRoleService,
      RolePermissionService rolePermissionService,
      PermissionService permissionService,
      PasswordEncoder passwordEncoder,
      JwtTokenProvider jwtTokenProvider
  ) {
    this.userService = userService;
    this.userRoleService = userRoleService;
    this.rolePermissionService = rolePermissionService;
    this.permissionService = permissionService;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenProvider = jwtTokenProvider;
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    User user = userService.findByUsername(request.username());
    if (user == null || Boolean.FALSE.equals(user.getEnabled())) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    boolean matched = passwordEncoder.matches(request.password(), user.getPasswordHash())
        || request.password().equals(user.getPasswordHash());
    if (!matched) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    String token = jwtTokenProvider.createToken(user.getId(), user.getUsername());
    return new LoginResponse(token, user.getId(), user.getUsername(), user.getDisplayName());
  }

  @GetMapping("/validate")
  public Map<String, Boolean> validate() {
    return Map.of("valid", true);
  }

  @GetMapping("/menus")
  public Map<String, List<String>> menus() {
    Set<String> permissionKeys = getCurrentUserPermissionKeys();
    List<String> menus = List.of("users", "roles", "permissions")
        .stream()
        .filter(menuKey -> permissionKeys.contains(menuKey + ":view"))
        .toList();
    return Map.of("menus", menus);
  }

  @GetMapping("/permissions")
  public Map<String, Set<String>> permissions() {
    return Map.of("permissions", getCurrentUserPermissionKeys());
  }

  private Set<String> getCurrentUserPermissionKeys() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getName() == null) {
      throw new UnauthorizedException("未登录");
    }

    User currentUser = userService.findByUsername(authentication.getName());
    if (currentUser == null) {
      throw new UnauthorizedException("用户不存在");
    }

    if ("admin".equalsIgnoreCase(currentUser.getUsername())) {
      return permissionService.list().stream()
          .map(permission -> permission.getResource() + ":" + permission.getAction())
          .collect(Collectors.toSet());
    }

    List<Long> roleIds = userRoleService.lambdaQuery()
        .eq(UserRole::getUserId, currentUser.getId())
        .list()
        .stream()
        .map(UserRole::getRoleId)
        .toList();
    if (roleIds.isEmpty()) {
      return Set.of();
    }

    Set<Long> permissionIds = rolePermissionService.lambdaQuery()
        .in(RolePermission::getRoleId, roleIds)
        .list()
        .stream()
        .map(RolePermission::getPermissionId)
        .collect(Collectors.toSet());
    if (permissionIds.isEmpty()) {
      return Set.of();
    }

    return permissionService.lambdaQuery()
        .in(Permission::getId, permissionIds)
        .list()
        .stream()
        .map(permission -> permission.getResource() + ":" + permission.getAction())
        .collect(Collectors.toSet());
  }
}
