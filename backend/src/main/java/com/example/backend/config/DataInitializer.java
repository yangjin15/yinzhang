package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.entity.Seal;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.SealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 数据初始化器
 * 在系统启动时创建测试数据
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SealRepository sealRepository;

    @Override
    public void run(String... args) throws Exception {
        // 创建测试用户
        createTestUsers();

        // 创建测试印章
        createTestSeals();

        System.out.println("测试数据初始化完成！");
    }

    private void createTestUsers() {
        // 检查是否已有管理员用户
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("encoded_admin123"); // 使用与UserServiceImpl相同的编码方式
            admin.setRealName("系统管理员");
            admin.setEmail("admin@company.com");
            admin.setPhone("13800138000");
            admin.setDepartment("信息技术部");
            admin.setPosition("系统管理员");
            admin.setRole(User.UserRole.ADMIN);
            admin.setStatus(User.UserStatus.ACTIVE);
            admin.setCreateTime(LocalDateTime.now());
            admin.setUpdateTime(LocalDateTime.now());
            admin.setLoginCount(0);

            userRepository.save(admin);
            System.out.println("创建管理员用户: admin/admin123");
        }

        // 检查是否已有测试用户
        if (!userRepository.existsByUsername("test_user")) {
            User testUser = new User();
            testUser.setUsername("test_user");
            testUser.setPassword("encoded_123456");
            testUser.setRealName("测试用户");
            testUser.setEmail("test@company.com");
            testUser.setPhone("13800138001");
            testUser.setDepartment("行政部");
            testUser.setPosition("行政专员");
            testUser.setRole(User.UserRole.USER);
            testUser.setStatus(User.UserStatus.ACTIVE);
            testUser.setCreateTime(LocalDateTime.now());
            testUser.setUpdateTime(LocalDateTime.now());
            testUser.setLoginCount(0);

            userRepository.save(testUser);
            System.out.println("创建测试用户: test_user/123456");
        }

        // 创建经理用户
        if (!userRepository.existsByUsername("manager")) {
            User manager = new User();
            manager.setUsername("manager");
            manager.setPassword("encoded_manager123");
            manager.setRealName("部门经理");
            manager.setEmail("manager@company.com");
            manager.setPhone("13800138002");
            manager.setDepartment("行政部");
            manager.setPosition("部门经理");
            manager.setRole(User.UserRole.MANAGER);
            manager.setStatus(User.UserStatus.ACTIVE);
            manager.setCreateTime(LocalDateTime.now());
            manager.setUpdateTime(LocalDateTime.now());
            manager.setLoginCount(0);

            userRepository.save(manager);
            System.out.println("创建经理用户: manager/manager123");
        }
    }

    private void createTestSeals() {
        // 创建公司公章
        if (!sealRepository.existsByName("公司公章")) {
            Seal officialSeal = new Seal();
            officialSeal.setName("公司公章");
            officialSeal.setType(Seal.SealType.OFFICIAL);
            officialSeal.setShape(Seal.SealShape.ROUND);
            officialSeal.setOwnerDepartment("总经理办公室");
            officialSeal.setKeeperDepartment("行政部");
            officialSeal.setDescription("公司对外正式文件专用印章");
            officialSeal.setKeeper("行政部经理");
            officialSeal.setKeeperPhone("13800138888");
            officialSeal.setLocation("行政部办公室保险柜");
            officialSeal.setStatus(Seal.SealStatus.IN_USE);
            officialSeal.setCreateTime(LocalDateTime.now());

            sealRepository.save(officialSeal);
            System.out.println("创建印章: 公司公章");
        }

        // 创建财务专用章
        if (!sealRepository.existsByName("财务专用章")) {
            Seal financeSeal = new Seal();
            financeSeal.setName("财务专用章");
            financeSeal.setType(Seal.SealType.FINANCE);
            financeSeal.setShape(Seal.SealShape.ROUND);
            financeSeal.setOwnerDepartment("财务部");
            financeSeal.setKeeperDepartment("财务部");
            financeSeal.setDescription("财务相关文件专用印章");
            financeSeal.setKeeper("财务部经理");
            financeSeal.setKeeperPhone("13800138889");
            financeSeal.setLocation("财务部办公室保险柜");
            financeSeal.setStatus(Seal.SealStatus.IN_USE);
            financeSeal.setCreateTime(LocalDateTime.now());

            sealRepository.save(financeSeal);
            System.out.println("创建印章: 财务专用章");
        }

        // 创建合同专用章
        if (!sealRepository.existsByName("合同专用章")) {
            Seal contractSeal = new Seal();
            contractSeal.setName("合同专用章");
            contractSeal.setType(Seal.SealType.CONTRACT);
            contractSeal.setShape(Seal.SealShape.SQUARE);
            contractSeal.setOwnerDepartment("法务部");
            contractSeal.setKeeperDepartment("法务部");
            contractSeal.setDescription("合同签署专用印章");
            contractSeal.setKeeper("法务部经理");
            contractSeal.setKeeperPhone("13800138890");
            contractSeal.setLocation("法务部办公室保险柜");
            contractSeal.setStatus(Seal.SealStatus.IN_USE);
            contractSeal.setCreateTime(LocalDateTime.now());

            sealRepository.save(contractSeal);
            System.out.println("创建印章: 合同专用章");
        }

        // 创建人事专用章
        if (!sealRepository.existsByName("人事专用章")) {
            Seal hrSeal = new Seal();
            hrSeal.setName("人事专用章");
            hrSeal.setType(Seal.SealType.HR);
            hrSeal.setShape(Seal.SealShape.OVAL);
            hrSeal.setOwnerDepartment("人事部");
            hrSeal.setKeeperDepartment("人事部");
            hrSeal.setDescription("人事相关文件专用印章");
            hrSeal.setKeeper("人事部经理");
            hrSeal.setKeeperPhone("13800138891");
            hrSeal.setLocation("人事部办公室保险柜");
            hrSeal.setStatus(Seal.SealStatus.IN_USE);
            hrSeal.setCreateTime(LocalDateTime.now());

            sealRepository.save(hrSeal);
            System.out.println("创建印章: 人事专用章");
        }
    }
}