package com.example.backend.service.impl;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 用户服务实现类
 * 实现用户管理相关的业务逻辑
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User createUser(User user) {
        // 检查用户名是否已存在
        if (existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在: " + user.getUsername());
        }

        // 检查邮箱是否已存在
        if (user.getEmail() != null && existsByEmail(user.getEmail())) {
            throw new RuntimeException("邮箱已存在: " + user.getEmail());
        }

        // 设置默认状态
        if (user.getStatus() == null) {
            user.setStatus(User.UserStatus.ACTIVE);
        }

        // 简单的密码加密（实际项目中应使用BCrypt等）
        if (user.getPassword() != null) {
            user.setPassword(encodePassword(user.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));

        // 更新基本信息（不包括用户名和密码）
        existingUser.setRealName(user.getRealName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhone(user.getPhone());
        existingUser.setDepartment(user.getDepartment());
        existingUser.setPosition(user.getPosition());
        existingUser.setBio(user.getBio());
        existingUser.setAvatar(user.getAvatar());

        // 管理员可以更新角色和状态
        if (user.getRole() != null) {
            existingUser.setRole(user.getRole());
        }
        if (user.getStatus() != null) {
            existingUser.setStatus(user.getStatus());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("用户不存在: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<User> getUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return new PageResponse<User>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<User> searchUsers(String keyword, User.UserStatus status,
            User.UserRole role, Pageable pageable) {
        Page<User> page = userRepository.findByConditions(keyword, status, role, pageable);
        return new PageResponse<User>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    public User updateUserStatus(Long id, User.UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Override
    public User updateUserRole(Long id, User.UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // 检查密码（简单比较，实际项目中应使用BCrypt）
            if (user.getPassword().equals(encodePassword(password))) {
                // 检查用户状态
                if (user.getStatus() == User.UserStatus.ACTIVE) {
                    return Optional.of(user);
                } else {
                    throw new RuntimeException("用户账户已被禁用");
                }
            }
        }

        return Optional.empty();
    }

    @Override
    public void updateLoginInfo(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));

        user.setLastLogin(LocalDateTime.now());
        user.setLoginCount(user.getLoginCount() + 1);
        userRepository.save(user);
    }

    @Override
    public boolean changePassword(Long id, String oldPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));

        // 验证旧密码
        if (!user.getPassword().equals(encodePassword(oldPassword))) {
            return false;
        }

        // 设置新密码
        user.setPassword(encodePassword(newPassword));
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // 总用户数
        long totalUsers = userRepository.count();
        statistics.put("totalUsers", totalUsers);

        // 按状态统计
        List<Object[]> statusStats = userRepository.countByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] stat : statusStats) {
            statusMap.put(stat[0].toString(), (Long) stat[1]);
        }
        statistics.put("byStatus", statusMap);

        // 按角色统计
        List<Object[]> roleStats = userRepository.countByRole();
        Map<String, Long> roleMap = new HashMap<>();
        for (Object[] stat : roleStats) {
            roleMap.put(stat[0].toString(), (Long) stat[1]);
        }
        statistics.put("byRole", roleMap);

        // 按部门统计
        List<Object[]> deptStats = userRepository.countByDepartment();
        Map<String, Long> deptMap = new HashMap<>();
        for (Object[] stat : deptStats) {
            deptMap.put(stat[0].toString(), (Long) stat[1]);
        }
        statistics.put("byDepartment", deptMap);

        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getActiveUsers(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return userRepository.findActiveUsers(since);
    }

    @Override
    public void deleteUsers(List<Long> ids) {
        for (Long id : ids) {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
            }
        }
    }

    @Override
    public boolean resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));

        user.setPassword(encodePassword(newPassword));
        userRepository.save(user);
        return true;
    }

    /**
     * 简单的密码编码（实际项目中应使用BCrypt）
     * 
     * @param password 原始密码
     * @return 编码后的密码
     */
    private String encodePassword(String password) {
        // 这里使用简单的编码，实际项目中应该使用BCryptPasswordEncoder
        return "encoded_" + password;
    }
}