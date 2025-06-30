package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户数据访问接口
 * 提供用户管理相关的数据库操作方法
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查找用户
     * 
     * @param username 用户名
     * @return 用户对象
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     * 
     * @param email 邮箱
     * @return 用户对象
     */
    Optional<User> findByEmail(String email);

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
     * 根据用户状态查找用户
     * 
     * @param status   用户状态
     * @param pageable 分页参数
     * @return 用户分页列表
     */
    Page<User> findByStatus(User.UserStatus status, Pageable pageable);

    /**
     * 根据角色查找用户
     * 
     * @param role     用户角色
     * @param pageable 分页参数
     * @return 用户分页列表
     */
    Page<User> findByRole(User.UserRole role, Pageable pageable);

    /**
     * 根据部门查找用户
     * 
     * @param department 部门
     * @param pageable   分页参数
     * @return 用户分页列表
     */
    Page<User> findByDepartment(String department, Pageable pageable);

    /**
     * 根据关键字搜索用户（用户名、真实姓名、部门）
     * 
     * @param keyword  搜索关键字
     * @param pageable 分页参数
     * @return 用户分页列表
     */
    @Query("SELECT u FROM User u WHERE u.username LIKE %:keyword% " +
            "OR u.realName LIKE %:keyword% OR u.department LIKE %:keyword%")
    Page<User> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 根据状态和角色查找用户
     * 
     * @param status   用户状态
     * @param role     用户角色
     * @param pageable 分页参数
     * @return 用户分页列表
     */
    Page<User> findByStatusAndRole(User.UserStatus status, User.UserRole role, Pageable pageable);

    /**
     * 根据关键字、状态、角色进行复合查询
     * 
     * @param keyword  搜索关键字
     * @param status   用户状态
     * @param role     用户角色
     * @param pageable 分页参数
     * @return 用户分页列表
     */
    @Query("SELECT u FROM User u WHERE " +
            "(:keyword IS NULL OR u.username LIKE %:keyword% OR u.realName LIKE %:keyword% OR u.department LIKE %:keyword%) "
            +
            "AND (:status IS NULL OR u.status = :status) " +
            "AND (:role IS NULL OR u.role = :role)")
    Page<User> findByConditions(@Param("keyword") String keyword,
            @Param("status") User.UserStatus status,
            @Param("role") User.UserRole role,
            Pageable pageable);

    /**
     * 统计用户数量按状态
     * 
     * @return 状态统计列表
     */
    @Query("SELECT u.status, COUNT(u) FROM User u GROUP BY u.status")
    List<Object[]> countByStatus();

    /**
     * 统计用户数量按角色
     * 
     * @return 角色统计列表
     */
    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countByRole();

    /**
     * 统计用户数量按部门
     * 
     * @return 部门统计列表
     */
    @Query("SELECT u.department, COUNT(u) FROM User u GROUP BY u.department")
    List<Object[]> countByDepartment();

    /**
     * 查找活跃用户（最近登录）
     * 
     * @param days 天数
     * @return 活跃用户列表
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin >= :days")
    List<User> findActiveUsers(@Param("days") java.time.LocalDateTime days);
}