package com.example.auth.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.auth.entity.RolePermission;
import com.example.auth.mapper.RolePermissionMapper;
import com.example.auth.service.RolePermissionService;
import org.springframework.stereotype.Service;

@Service
public class RolePermissionServiceImpl extends ServiceImpl<RolePermissionMapper, RolePermission> implements RolePermissionService {
}
