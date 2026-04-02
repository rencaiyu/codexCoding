package com.example.auth.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("sys_permission")
public class Permission {
  private Long id;
  private String code;
  private String name;
  private String description;
  private Long menuId;
  private String resource;
  private String action;
  private String permissionType;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
