package com.example.auth.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("sys_role_menu")
public class RoleMenu {
  private Long id;
  private Long roleId;
  private Long menuId;
}
