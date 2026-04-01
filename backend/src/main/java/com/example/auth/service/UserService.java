package com.example.auth.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.auth.entity.User;

public interface UserService extends IService<User> {
  User findByUsername(String username);
}
