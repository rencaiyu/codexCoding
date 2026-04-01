package com.example.auth.controller;

import com.example.auth.entity.Menu;
import com.example.auth.service.MenuService;
import jakarta.validation.Valid;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menus")
public class MenuController {
  private final MenuService menuService;

  public MenuController(MenuService menuService) {
    this.menuService = menuService;
  }

  @GetMapping
  public List<Menu> list() {
    return menuService.list().stream()
        .sorted(Comparator.comparing(Menu::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
        .toList();
  }

  @GetMapping("/tree")
  public List<MenuNode> tree() {
    return buildTree(menuService.list());
  }

  @PostMapping
  public Menu create(@Valid @RequestBody Menu menu) {
    menuService.save(menu);
    return menu;
  }

  @PostMapping("/{id}")
  public Menu update(@PathVariable Long id, @Valid @RequestBody Menu menu) {
    menu.setId(id);
    menuService.updateById(menu);
    return menu;
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    menuService.removeById(id);
  }

  static List<MenuNode> buildTree(List<Menu> menus) {
    Map<Long, List<Menu>> grouped = menus.stream()
        .collect(Collectors.groupingBy(menu -> menu.getParentId() == null ? 0L : menu.getParentId()));
    return buildChildren(0L, grouped);
  }

  private static List<MenuNode> buildChildren(Long parentId, Map<Long, List<Menu>> grouped) {
    return grouped.getOrDefault(parentId, List.of()).stream()
        .sorted(Comparator.comparing(Menu::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
        .map(menu -> new MenuNode(menu, buildChildren(menu.getId(), grouped)))
        .toList();
  }

  public record MenuNode(Menu menu, List<MenuNode> children) {
  }
}
