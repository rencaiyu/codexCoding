package com.example.auth.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("sys_user")
public class User {
  private Long id;
  private String username;
  private String displayName;
  private String email;
  private String passwordHash;
  private Boolean enabled;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
