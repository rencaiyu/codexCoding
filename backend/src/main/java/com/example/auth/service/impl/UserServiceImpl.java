package com.example.auth.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.auth.entity.User;
import com.example.auth.mapper.UserMapper;
import com.example.auth.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

  @Override
  public User findByUsername(String username) {
    return lambdaQuery().eq(User::getUsername, username).one();
  }
}
