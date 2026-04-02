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
import java.util.LinkedHashSet;
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

  private static final String MENU_PERMISSION_TYPE = "MENU";
  private static final String BUTTON_PERMISSION_TYPE = "BUTTON";

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

    Set<Long> roleMenuIds = roleMenuService.lambdaQuery()
        .in(RoleMenu::getRoleId, roleIds)
        .list()
        .stream()
        .map(RoleMenu::getMenuId)
        .collect(Collectors.toCollection(LinkedHashSet::new));

    Set<Long> permissionIds = getRolePermissionIds(roleIds);
    Set<Long> menuIdsFromMenuPermissions = permissionIds.isEmpty()
        ? Set.of()
        : permissionService.lambdaQuery()
            .in(Permission::getId, permissionIds)
            .eq(Permission::getPermissionType, MENU_PERMISSION_TYPE)
            .list()
            .stream()
            .map(Permission::getMenuId)
            .filter(id -> id != null)
            .collect(Collectors.toCollection(LinkedHashSet::new));

    Set<Long> menuIds = new LinkedHashSet<>();
    menuIds.addAll(roleMenuIds);
    menuIds.addAll(menuIdsFromMenuPermissions);

    if (menuIds.isEmpty()) return Map.of("menus", List.of());

    return Map.of("menus", menuService.lambdaQuery().in(Menu::getId, menuIds).list().stream().map(Menu::getMenuKey).toList());
  }

  @GetMapping("/permissions")
  public Map<String, Set<String>> permissions() {
    return Map.of("permissions", getCurrentUserButtonPermissionKeys());
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

  private Set<Long> getRolePermissionIds(List<Long> roleIds) {
    if (roleIds == null || roleIds.isEmpty()) return Set.of();
    return rolePermissionService.lambdaQuery().in(RolePermission::getRoleId, roleIds).list().stream().map(RolePermission::getPermissionId).collect(Collectors.toSet());
  }

  private Set<String> getCurrentUserButtonPermissionKeys() {
    User currentUser = getCurrentUser();

    if ("admin".equalsIgnoreCase(currentUser.getUsername())) {
      return permissionService.lambdaQuery()
          .eq(Permission::getPermissionType, BUTTON_PERMISSION_TYPE)
          .list()
          .stream()
          .map(permission -> permission.getResource() + ":" + permission.getAction())
          .collect(Collectors.toSet());
    }

    List<Long> roleIds = getCurrentRoleIds(currentUser.getId());
    if (roleIds.isEmpty()) return Set.of();

    Set<Long> permissionIds = getRolePermissionIds(roleIds);
    if (permissionIds.isEmpty()) return Set.of();

    Set<Long> visibleMenuIds = getVisibleMenuIds(roleIds, permissionIds);

    return permissionService.lambdaQuery()
        .in(Permission::getId, permissionIds)
        .eq(Permission::getPermissionType, BUTTON_PERMISSION_TYPE)
        .list()
        .stream()
        .filter(permission -> permission.getMenuId() == null || visibleMenuIds.contains(permission.getMenuId()))
        .map(permission -> permission.getResource() + ":" + permission.getAction())
        .collect(Collectors.toSet());
  }

  private Set<Long> getVisibleMenuIds(List<Long> roleIds, Set<Long> permissionIds) {
    Set<Long> roleMenuIds = roleMenuService.lambdaQuery()
        .in(RoleMenu::getRoleId, roleIds)
        .list()
        .stream()
        .map(RoleMenu::getMenuId)
        .collect(Collectors.toCollection(LinkedHashSet::new));

    Set<Long> menuIdsFromMenuPermissions = permissionIds.isEmpty()
        ? Set.of()
        : permissionService.lambdaQuery()
            .in(Permission::getId, permissionIds)
            .eq(Permission::getPermissionType, MENU_PERMISSION_TYPE)
            .list()
            .stream()
            .map(Permission::getMenuId)
            .filter(id -> id != null)
            .collect(Collectors.toCollection(LinkedHashSet::new));

    Set<Long> visibleMenuIds = new LinkedHashSet<>();
    visibleMenuIds.addAll(roleMenuIds);
    visibleMenuIds.addAll(menuIdsFromMenuPermissions);
    return visibleMenuIds;
  }
}
