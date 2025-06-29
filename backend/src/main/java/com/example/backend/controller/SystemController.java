package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 系统管理控制器
 */
@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SystemController {

    /**
     * 系统健康检查
     * GET /api/system/health
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("version", "1.0.0");
        healthInfo.put("database", "Connected");

        return ResponseEntity.ok(ApiResponse.success("系统运行正常", healthInfo));
    }

    /**
     * 获取系统信息
     * GET /api/system/info
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemInfo() {
        Map<String, Object> systemInfo = new HashMap<>();
        systemInfo.put("applicationName", "印章管理系统");
        systemInfo.put("version", "1.0.0");
        systemInfo.put("author", "YinZhang Team");
        systemInfo.put("description", "企业印章使用申请、审批和管理系统");

        return ResponseEntity.ok(ApiResponse.success("获取成功", systemInfo));
    }
}