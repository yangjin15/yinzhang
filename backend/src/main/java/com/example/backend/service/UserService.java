package com.example.backend.service;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.User;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 用户服务接口
 * 定义用户管理相关的业务方法
 */
public interface UserService {

    /**
     * 创建用户
     * 
     * @param user 用户信息
     * @return 创建的用户
     */
    User createUser(User user);

    /**
     * 更新用户信息
     * 
     * @param id   用户ID
     * @param user 用户信息
     * @return 更新后的用户
     */
    User updateUser(Long id, User user);

    /**
     * 删除用户
     * 
     * @param id 用户ID
     */
    void deleteUser(Long id);

    /**
     * 根据ID获取用户
     * 
     * @param id 用户ID
     * @return 用户信息
     */
    Optional<User> getUserById(Long id);

    /**
     * 根据用户名获取用户
     * 
     * @param username 用户名
     * @return 用户信息
     */
    Optional<User> getUserByUsername(String username);

    /**
     * 分页获取用户列表
     * 
     * @param pageable 分页参数
     * @return 用户分页列表
     */
    PageResponse<User> getUsers(Pageable pageable);

    /**
     * 根据条件搜索用户
     * 
     * @param keyword  搜索关键字
     * @param status   用户状态
     * @param role     用户角色
     * @param pageable 分页参数
     * @return 用户分页列表
     */
    PageResponse<User> searchUsers(String keyword, User.UserStatus status,
            User.UserRole role, Pageable pageable);

    /**
     * 更改用户状态
     * 
     * @param id     用户ID
     * @param status 新状态
     * @return 更新后的用户
     */
    User updateUserStatus(Long id, User.UserStatus status);

    /**
     * 更改用户角色
     * 
     * @param id   用户ID
     * @param role 新角色
     * @return 更新后的用户
     */
    User updateUserRole(Long id, User.UserRole role);

    /**
     * 检查用户名是否存在
     * 
     * @param username 用户名
     * @return 是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     * 
     * @param email 邮箱
     * @return 是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 用户登录
     * 
     * @param username 用户名
     * @param password 密码
     * @return 用户信息
     */
    Optional<User> login(String username, String password);

    /**
     * 更新登录信息
     * 
     * @param id 用户ID
     */
    void updateLoginInfo(Long id);

    /**
     * 修改密码
     * 
     * @param id          用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean changePassword(Long id, String oldPassword, String newPassword);

    /**
     * 获取用户统计信息
     * 
     * @return 统计信息
     */
    Map<String, Object> getUserStatistics();

    /**
     * 获取活跃用户列表
     * 
     * @param days 天数
     * @return 活跃用户列表
     */
    List<User> getActiveUsers(int days);

    /**
     * 批量删除用户
     * 
     * @param ids 用户ID列表
     */
    void deleteUsers(List<Long> ids);

    /**
     * 重置用户密码
     * 
     * @param id          用户ID
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean resetPassword(Long id, String newPassword);
}