package com.example.auth.controller;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.LoginResponse;
import com.example.auth.entity.Menu;
import com.example.auth.entity.Permission;
import com.example.auth.entity.RoleMenu;
import com.example.auth.entity.RolePermission;
import com.example.auth.entity.User;
import com.example.auth.entity.UserRole;
import com.example.auth.exception.UnauthorizedException;
import com.example.auth.security.JwtTokenProvider;
import com.example.auth.service.MenuService;
import com.example.auth.service.PermissionService;
import com.example.auth.service.RoleMenuService;
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
  private final RoleMenuService roleMenuService;
  private final PermissionService permissionService;
  private final MenuService menuService;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;

  public AuthController(
      UserService userService,
      UserRoleService userRoleService,
      RolePermissionService rolePermissionService,
      RoleMenuService roleMenuService,
      PermissionService permissionService,
      MenuService menuService,
      PasswordEncoder passwordEncoder,
      JwtTokenProvider jwtTokenProvider
  ) {
    this.userService = userService;
    this.userRoleService = userRoleService;
    this.rolePermissionService = rolePermissionService;
    this.roleMenuService = roleMenuService;
    this.permissionService = permissionService;
    this.menuService = menuService;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenProvider = jwtTokenProvider;
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    User user = userService.findByUsername(request.username());
    if (user == null || Boolean.FALSE.equals(user.getEnabled())) throw new UnauthorizedException("用户名或密码错误");

    boolean matched = passwordEncoder.matches(request.password(), user.getPasswordHash()) || request.password().equals(user.getPasswordHash());
    if (!matched) throw new UnauthorizedException("用户名或密码错误");

    String token = jwtTokenProvider.createToken(user.getId(), user.getUsername());
    return new LoginResponse(token, user.getId(), user.getUsername(), user.getDisplayName());
  }

  @GetMapping("/validate")
  public Map<String, Boolean> validate() {
    return Map.of("valid", true);
  }

  @GetMapping("/menus")
  public Map<String, List<String>> menus() {
    User currentUser = getCurrentUser();
    if ("admin".equalsIgnoreCase(currentUser.getUsername())) {
      return Map.of("menus", menuService.list().stream().map(Menu::getMenuKey).toList());
    }

    List<Long> roleIds = getCurrentRoleIds(currentUser.getId());
    if (roleIds.isEmpty()) return Map.of("menus", List.of());

    Set<Long> menuIds = roleMenuService.lambdaQuery().in(RoleMenu::getRoleId, roleIds).list().stream().map(RoleMenu::getMenuId).collect(Collectors.toSet());
    if (menuIds.isEmpty()) return Map.of("menus", List.of());

    return Map.of("menus", menuService.lambdaQuery().in(Menu::getId, menuIds).list().stream().map(Menu::getMenuKey).toList());
  }

  @GetMapping("/permissions")
  public Map<String, Set<String>> permissions() {
    return Map.of("permissions", getCurrentUserPermissionKeys());
  }

  private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getName() == null) throw new UnauthorizedException("未登录");

    User currentUser = userService.findByUsername(authentication.getName());
    if (currentUser == null) throw new UnauthorizedException("用户不存在");
    return currentUser;
  }

  private List<Long> getCurrentRoleIds(Long userId) {
    return userRoleService.lambdaQuery().eq(UserRole::getUserId, userId).list().stream().map(UserRole::getRoleId).toList();
  }

  private Set<String> getCurrentUserPermissionKeys() {
    User currentUser = getCurrentUser();

    if ("admin".equalsIgnoreCase(currentUser.getUsername())) {
      return permissionService.list().stream().map(permission -> permission.getResource() + ":" + permission.getAction()).collect(Collectors.toSet());
    }

    List<Long> roleIds = getCurrentRoleIds(currentUser.getId());
    if (roleIds.isEmpty()) return Set.of();

    Set<Long> permissionIds = rolePermissionService.lambdaQuery().in(RolePermission::getRoleId, roleIds).list().stream().map(RolePermission::getPermissionId).collect(Collectors.toSet());
    if (permissionIds.isEmpty()) return Set.of();

    return permissionService.lambdaQuery().in(Permission::getId, permissionIds).list().stream().map(permission -> permission.getResource() + ":" + permission.getAction()).collect(Collectors.toSet());
  }
}
