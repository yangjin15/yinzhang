package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * 认证控制器
 * 处理用户登录、注册、登出等认证相关请求
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * 用户登录
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("用户名不能为空"));
            }

            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("密码不能为空"));
            }

            // 验证用户登录
            Optional<User> userOpt = userService.login(username, password);
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // 检查用户状态
                if (user.getStatus() != User.UserStatus.ACTIVE) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.badRequest("用户已被禁用，请联系管理员"));
                }

                // 更新登录信息
                userService.updateLoginInfo(user.getId());

                // 清除密码信息后返回
                user.setPassword(null);

                return ResponseEntity.ok(ApiResponse.success("登录成功", user));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("用户名或密码错误"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("登录失败: " + e.getMessage()));
        }
    }

    /**
     * 用户注册
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody User user) {
        try {
            // 参数验证
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("用户名不能为空"));
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("密码不能为空"));
            }

            if (user.getRealName() == null || user.getRealName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("真实姓名不能为空"));
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("邮箱不能为空"));
            }

            if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("手机号不能为空"));
            }

            if (user.getDepartment() == null || user.getDepartment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("部门不能为空"));
            }

            // 检查用户名是否已存在
            if (userService.existsByUsername(user.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("用户名已存在"));
            }

            // 检查邮箱是否已存在
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("邮箱已存在"));
            }

            // 设置默认值
            if (user.getRole() == null) {
                user.setRole(User.UserRole.USER); // 默认为普通用户
            }

            if (user.getStatus() == null) {
                user.setStatus(User.UserStatus.ACTIVE); // 默认为激活状态
            }

            user.setCreateTime(LocalDateTime.now());
            user.setUpdateTime(LocalDateTime.now());
            user.setLoginCount(0);

            // 创建用户
            User createdUser = userService.createUser(user);

            // 清除密码信息后返回
            createdUser.setPassword(null);

            return ResponseEntity.ok(ApiResponse.success("注册成功", createdUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("注册失败: " + e.getMessage()));
        }
    }

    /**
     * 用户登出
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        try {
            // 在实际项目中，这里可以处理JWT token的黑名单等逻辑
            // 目前我们只是返回成功响应
            return ResponseEntity.ok(ApiResponse.success("登出成功", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("登出失败: " + e.getMessage()));
        }
    }

    /**
     * 刷新令牌
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken() {
        try {
            // 在实际项目中，这里可以实现JWT token的刷新逻辑
            // 目前我们只是返回一个模拟的响应
            return ResponseEntity.ok(ApiResponse.success("令牌刷新成功", "new-token"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("令牌刷新失败: " + e.getMessage()));
        }
    }

    /**
     * 获取当前用户信息
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@RequestParam String username) {
        try {
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("用户名不能为空"));
            }

            Optional<User> userOpt = userService.getUserByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // 清除密码信息后返回
                user.setPassword(null);
                return ResponseEntity.ok(ApiResponse.success("获取用户信息成功", user));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("获取用户信息失败: " + e.getMessage()));
        }
    }
}