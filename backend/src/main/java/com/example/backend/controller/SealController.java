package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.common.PageResponse;
import com.example.backend.entity.Seal;
import com.example.backend.service.SealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 印章管理控制器
 */
@RestController
@RequestMapping("/api/seals")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SealController {

    @Autowired
    private SealService sealService;

    /**
     * 分页查询印章列表
     * GET /api/seals?page=1&size=10&keyword=公章&status=ACTIVE
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Seal>>> getSeals(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Seal.SealStatus status) {

        try {
            PageResponse<Seal> result = sealService.findSeals(page, size, keyword, status);
            return ResponseEntity.ok(ApiResponse.success("获取成功", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("获取印章列表失败: " + e.getMessage()));
        }
    }

    /**
     * 根据ID查询印章详情
     * GET /api/seals/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Seal>> getSealById(@PathVariable Long id) {
        try {
            Optional<Seal> seal = sealService.findById(id);
            if (seal.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("获取成功", seal.get()));
            } else {
                return ResponseEntity.notFound()
                        .build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("获取印章详情失败: " + e.getMessage()));
        }
    }

    /**
     * 创建新印章
     * POST /api/seals
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Seal>> createSeal(@RequestBody Seal seal) {
        try {
            // 基本验证
            if (seal.getName() == null || seal.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("印章名称不能为空"));
            }

            if (seal.getType() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("印章类型不能为空"));
            }

            if (seal.getKeeper() == null || seal.getKeeper().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("保管人不能为空"));
            }

            if (seal.getKeeperPhone() == null || seal.getKeeperPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("保管人电话不能为空"));
            }

            if (seal.getLocation() == null || seal.getLocation().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("存放位置不能为空"));
            }

            Seal createdSeal = sealService.createSeal(seal);
            return ResponseEntity.ok(ApiResponse.success("创建成功", createdSeal));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("创建印章失败: " + e.getMessage()));
        }
    }

    /**
     * 更新印章信息
     * PUT /api/seals/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Seal>> updateSeal(@PathVariable Long id, @RequestBody Seal seal) {
        try {
            if (!sealService.existsById(id)) {
                return ResponseEntity.notFound()
                        .build();
            }

            Seal updatedSeal = sealService.updateSeal(id, seal);
            return ResponseEntity.ok(ApiResponse.success("更新成功", updatedSeal));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("更新印章失败: " + e.getMessage()));
        }
    }

    /**
     * 删除印章
     * DELETE /api/seals/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSeal(@PathVariable Long id) {
        try {
            if (!sealService.existsById(id)) {
                return ResponseEntity.notFound()
                        .build();
            }

            sealService.deleteSeal(id);
            return ResponseEntity.ok(ApiResponse.success("删除成功", null));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("删除印章失败: " + e.getMessage()));
        }
    }

    /**
     * 更新印章状态
     * PATCH /api/seals/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Seal>> updateSealStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        try {
            if (!sealService.existsById(id)) {
                return ResponseEntity.notFound()
                        .build();
            }

            String statusStr = request.get("status");
            if (statusStr == null || statusStr.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("状态不能为空"));
            }

            Seal.SealStatus status;
            try {
                status = Seal.SealStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("无效的状态值: " + statusStr));
            }

            Seal updatedSeal = sealService.updateSealStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("状态更新成功", updatedSeal));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("更新印章状态失败: " + e.getMessage()));
        }
    }

    /**
     * 根据保管人查询印章
     * GET /api/seals/keeper/{keeper}
     */
    @GetMapping("/keeper/{keeper}")
    public ResponseEntity<ApiResponse<List<Seal>>> getSealsByKeeper(@PathVariable String keeper) {
        try {
            List<Seal> seals = sealService.findByKeeper(keeper);
            return ResponseEntity.ok(ApiResponse.success("获取成功", seals));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("获取印章列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取印章统计信息
     * GET /api/seals/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSealStatistics() {
        try {
            Map<String, Object> statistics = sealService.getSealStatistics();
            return ResponseEntity.ok(ApiResponse.success("获取成功", statistics));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("获取统计信息失败: " + e.getMessage()));
        }
    }

    /**
     * 获取印章类型枚举
     * GET /api/seals/types
     */
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<Seal.SealType[]>> getSealTypes() {
        return ResponseEntity.ok(ApiResponse.success("获取成功", Seal.SealType.values()));
    }

    /**
     * 获取印章状态枚举
     * GET /api/seals/statuses
     */
    @GetMapping("/statuses")
    public ResponseEntity<ApiResponse<Seal.SealStatus[]>> getSealStatuses() {
        return ResponseEntity.ok(ApiResponse.success("获取成功", Seal.SealStatus.values()));
    }
}