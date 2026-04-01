package com.example.auth.controller;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.LoginResponse;
import com.example.auth.entity.User;
import com.example.auth.exception.UnauthorizedException;
import com.example.auth.security.JwtTokenProvider;
import com.example.auth.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
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
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;

  public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
    this.userService = userService;
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
}
