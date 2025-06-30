package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.common.PageResponse;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 用户管理控制器
 * 提供用户管理相关的RESTful API接口
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 创建用户
     * POST /api/users
     */
    @PostMapping
    public ApiResponse<User> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ApiResponse.success("用户创建成功", createdUser);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 更新用户信息
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ApiResponse.success("用户信息更新成功", updatedUser);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 删除用户
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ApiResponse.success("用户删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 根据ID获取用户
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        try {
            Optional<User> user = userService.getUserById(id);
            if (user.isPresent()) {
                return ApiResponse.success("获取用户信息成功", user.get());
            } else {
                return ApiResponse.error(404, "用户不存在");
            }
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 分页获取用户列表
     * GET /api/users?page=0&size=10&sort=createTime,desc
     */
    @GetMapping
    public ApiResponse<PageResponse<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) User.UserStatus status,
            @RequestParam(required = false) User.UserRole role) {
        try {
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            PageResponse<User> users;
            if (keyword != null || status != null || role != null) {
                users = userService.searchUsers(keyword, status, role, pageable);
            } else {
                users = userService.getUsers(pageable);
            }

            return ApiResponse.success("获取用户列表成功", users);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 更改用户状态
     * PATCH /api/users/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<User> updateUserStatus(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            User.UserStatus status = User.UserStatus.valueOf(statusStr);
            User updatedUser = userService.updateUserStatus(id, status);
            return ApiResponse.success("用户状态更新成功", updatedUser);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 更改用户角色
     * PATCH /api/users/{id}/role
     */
    @PatchMapping("/{id}/role")
    public ApiResponse<User> updateUserRole(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String roleStr = request.get("role");
            User.UserRole role = User.UserRole.valueOf(roleStr);
            User updatedUser = userService.updateUserRole(id, role);
            return ApiResponse.success("用户角色更新成功", updatedUser);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 用户登录
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ApiResponse<User> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            Optional<User> user = userService.login(username, password);
            if (user.isPresent()) {
                // 更新登录信息
                userService.updateLoginInfo(user.get().getId());
                return ApiResponse.success("登录成功", user.get());
            } else {
                return ApiResponse.error(401, "用户名或密码错误");
            }
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 修改密码
     * POST /api/users/{id}/change-password
     */
    @PostMapping("/{id}/change-password")
    public ApiResponse<Void> changePassword(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");

            boolean success = userService.changePassword(id, oldPassword, newPassword);
            if (success) {
                return ApiResponse.success("密码修改成功", null);
            } else {
                return ApiResponse.error(400, "原密码错误");
            }
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 重置密码
     * POST /api/users/{id}/reset-password
     */
    @PostMapping("/{id}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");
            boolean success = userService.resetPassword(id, newPassword);
            if (success) {
                return ApiResponse.success("密码重置成功", null);
            } else {
                return ApiResponse.error(400, "密码重置失败");
            }
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 获取用户统计信息
     * GET /api/users/statistics
     */
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getUserStatistics() {
        try {
            Map<String, Object> statistics = userService.getUserStatistics();
            return ApiResponse.success("获取统计信息成功", statistics);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 检查用户名是否存在
     * GET /api/users/check-username?username=xxx
     */
    @GetMapping("/check-username")
    public ApiResponse<Boolean> checkUsername(@RequestParam String username) {
        try {
            boolean exists = userService.existsByUsername(username);
            return ApiResponse.success("检查完成", exists);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 检查邮箱是否存在
     * GET /api/users/check-email?email=xxx
     */
    @GetMapping("/check-email")
    public ApiResponse<Boolean> checkEmail(@RequestParam String email) {
        try {
            boolean exists = userService.existsByEmail(email);
            return ApiResponse.success("检查完成", exists);
        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 批量删除用户
     * DELETE /api/users/batch
     */
    @DeleteMapping("/batch")
    public ApiResponse<Void> deleteUsers(@RequestBody List<Long> ids) {
        try {
            userService.deleteUsers(ids);
            return ApiResponse.success("批量删除成功", null);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 用户注册
     * POST /api/users/register
     */
    @PostMapping("/register")
    public ApiResponse<User> register(@RequestBody Map<String, Object> request) {
        try {
            // 提取注册信息
            String username = (String) request.get("username");
            String realName = (String) request.get("realName");
            String password = (String) request.get("password");
            String email = (String) request.get("email");
            String phone = (String) request.get("phone");
            String department = (String) request.get("department");
            String position = (String) request.get("position");

            // 基本验证
            if (username == null || username.trim().isEmpty()) {
                return ApiResponse.error(400, "用户名不能为空");
            }
            if (realName == null || realName.trim().isEmpty()) {
                return ApiResponse.error(400, "真实姓名不能为空");
            }
            if (password == null || password.trim().isEmpty()) {
                return ApiResponse.error(400, "密码不能为空");
            }
            if (password.length() < 6) {
                return ApiResponse.error(400, "密码长度不能少于6位");
            }

            // 检查用户名是否已存在
            if (userService.existsByUsername(username)) {
                return ApiResponse.error(400, "用户名已存在");
            }

            // 检查邮箱是否已存在
            if (email != null && !email.trim().isEmpty() && userService.existsByEmail(email)) {
                return ApiResponse.error(400, "邮箱已存在");
            }

            // 创建用户对象
            User user = new User();
            user.setUsername(username.trim());
            user.setRealName(realName.trim());
            user.setPassword(password);
            user.setEmail(email != null ? email.trim() : null);
            user.setPhone(phone != null ? phone.trim() : null);
            user.setDepartment(department != null ? department.trim() : null);
            user.setPosition(position != null ? position.trim() : null);

            // 默认角色为普通用户
            user.setRole(User.UserRole.USER);
            // 默认状态为正常（可以设置为待激活PENDING，需要管理员审核）
            user.setStatus(User.UserStatus.ACTIVE);

            // 创建用户
            User createdUser = userService.createUser(user);

            // 清除密码字段后返回
            createdUser.setPassword(null);

            return ApiResponse.success("注册成功", createdUser);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }
}