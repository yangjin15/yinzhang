package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.common.PageResponse;
import com.example.backend.entity.SealApplication;
import com.example.backend.service.SealApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 用印申请管理控制器
 * 提供用印申请管理相关的RESTful API接口
 */
@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class SealApplicationController {

    @Autowired
    private SealApplicationService applicationService;

    /**
     * 创建申请
     * POST /api/applications
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SealApplication>> createApplication(@RequestBody SealApplication application) {
        try {
            // 参数验证
            if (application.getSealName() == null || application.getSealName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("印章名称不能为空"));
            }

            if (application.getSealType() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("印章类型不能为空"));
            }

            if (application.getApplicant() == null || application.getApplicant().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("申请人不能为空"));
            }

            if (application.getDepartment() == null || application.getDepartment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("申请部门不能为空"));
            }

            if (application.getPurpose() == null || application.getPurpose().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("用印目的不能为空"));
            }

            if (application.getExpectedTime() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("期望用印时间不能为空"));
            }

            SealApplication createdApplication = applicationService.createApplication(application);
            return ResponseEntity.ok(ApiResponse.success("申请创建成功", createdApplication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("创建申请失败: " + e.getMessage()));
        }
    }

    /**
     * 更新申请
     * PUT /api/applications/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SealApplication>> updateApplication(@PathVariable Long id,
            @RequestBody SealApplication application) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            SealApplication updatedApplication = applicationService.updateApplication(id, application);
            return ResponseEntity.ok(ApiResponse.success("申请更新成功", updatedApplication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("更新申请失败: " + e.getMessage()));
        }
    }

    /**
     * 删除申请
     * DELETE /api/applications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            applicationService.deleteApplication(id);
            return ResponseEntity.ok(ApiResponse.success("申请删除成功", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("删除申请失败: " + e.getMessage()));
        }
    }

    /**
     * 根据ID获取申请
     * GET /api/applications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SealApplication>> getApplicationById(@PathVariable Long id) {
        try {
            Optional<SealApplication> application = applicationService.getApplicationById(id);
            if (application.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("获取申请信息成功", application.get()));
            } else {
                return ResponseEntity.notFound()
                        .build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取申请信息失败: " + e.getMessage()));
        }
    }

    /**
     * 根据申请编号获取申请
     * GET /api/applications/no/{applicationNo}
     */
    @GetMapping("/no/{applicationNo}")
    public ResponseEntity<ApiResponse<SealApplication>> getApplicationByNo(@PathVariable String applicationNo) {
        try {
            Optional<SealApplication> application = applicationService.getApplicationByNo(applicationNo);
            if (application.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("获取申请信息成功", application.get()));
            } else {
                return ResponseEntity.notFound()
                        .build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取申请信息失败: " + e.getMessage()));
        }
    }

    /**
     * 分页获取申请列表
     * GET /api/applications?page=0&size=10&sort=applyTime,desc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SealApplication>>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applyTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) SealApplication.ApplicationStatus status,
            @RequestParam(required = false) String applicant,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        try {
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            PageResponse<SealApplication> applications;
            if (keyword != null || status != null || applicant != null ||
                    department != null || startTime != null || endTime != null) {
                applications = applicationService.searchApplications(
                        keyword, status, applicant, department, startTime, endTime, pageable);
            } else {
                applications = applicationService.getApplications(pageable);
            }

            return ResponseEntity.ok(ApiResponse.success("获取申请列表成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取申请列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取我的申请
     * GET /api/applications/my/{applicant}
     */
    @GetMapping("/my/{applicant}")
    public ResponseEntity<ApiResponse<PageResponse<SealApplication>>> getMyApplications(
            @PathVariable String applicant,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size,
                    Sort.by(Sort.Direction.DESC, "applyTime"));
            PageResponse<SealApplication> applications = applicationService.getMyApplications(applicant, pageable);
            return ResponseEntity.ok(ApiResponse.success("获取我的申请成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取我的申请失败: " + e.getMessage()));
        }
    }

    /**
     * 获取待审批申请
     * GET /api/applications/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PageResponse<SealApplication>>> getPendingApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size,
                    Sort.by(Sort.Direction.ASC, "applyTime"));
            PageResponse<SealApplication> applications = applicationService.getPendingApplications(pageable);
            return ResponseEntity.ok(ApiResponse.success("获取待审批申请成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取待审批申请失败: " + e.getMessage()));
        }
    }

    /**
     * 获取已完成申请
     * GET /api/applications/completed
     */
    @GetMapping("/completed")
    public ResponseEntity<ApiResponse<PageResponse<SealApplication>>> getCompletedApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size,
                    Sort.by(Sort.Direction.DESC, "updateTime"));
            PageResponse<SealApplication> applications = applicationService.getCompletedApplications(pageable);
            return ResponseEntity.ok(ApiResponse.success("获取已完成申请成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取已完成申请失败: " + e.getMessage()));
        }
    }

    /**
     * 审批申请
     * POST /api/applications/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SealApplication>> approveApplication(@PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            String statusStr = (String) request.get("status");
            String approver = (String) request.get("approver");
            String remark = (String) request.get("remark");

            if (statusStr == null || statusStr.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("审批状态不能为空"));
            }

            if (approver == null || approver.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("审批人不能为空"));
            }

            SealApplication.ApplicationStatus status;
            try {
                status = SealApplication.ApplicationStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("无效的审批状态: " + statusStr));
            }

            SealApplication updatedApplication = applicationService.approveApplication(id, status, approver, remark);
            return ResponseEntity.ok(ApiResponse.success("申请审批成功", updatedApplication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "申请审批失败: " + e.getMessage()));
        }
    }

    /**
     * 完成申请
     * POST /api/applications/{id}/complete
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<SealApplication>> completeApplication(@PathVariable Long id) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            SealApplication completedApplication = applicationService.completeApplication(id);
            return ResponseEntity.ok(ApiResponse.success("申请完成成功", completedApplication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "申请完成失败: " + e.getMessage()));
        }
    }

    /**
     * 撤回申请
     * POST /api/applications/{id}/withdraw
     */
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            String applicant = request.get("applicant");
            if (applicant == null || applicant.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("申请人不能为空"));
            }

            boolean success = applicationService.withdrawApplication(id, applicant);
            if (success) {
                return ResponseEntity.ok(ApiResponse.success("申请撤回成功", null));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("申请撤回失败"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "申请撤回失败: " + e.getMessage()));
        }
    }

    /**
     * 批量审批申请
     * POST /api/applications/batch-approve
     */
    @PostMapping("/batch-approve")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> batchApproveApplications(
            @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> ids = (List<Long>) request.get("ids");
            String statusStr = (String) request.get("status");
            String approver = (String) request.get("approver");
            String remark = (String) request.get("remark");

            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("申请ID列表不能为空"));
            }

            if (statusStr == null || statusStr.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("审批状态不能为空"));
            }

            if (approver == null || approver.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("审批人不能为空"));
            }

            SealApplication.ApplicationStatus status;
            try {
                status = SealApplication.ApplicationStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("无效的审批状态: " + statusStr));
            }

            int successCount = applicationService.batchApproveApplications(ids, status, approver, remark);

            Map<String, Integer> result = Map.of(
                    "total", ids.size(),
                    "success", successCount,
                    "failed", ids.size() - successCount);

            return ResponseEntity.ok(ApiResponse.success("批量审批完成", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "批量审批失败: " + e.getMessage()));
        }
    }

    /**
     * 获取申请统计信息
     * GET /api/applications/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApplicationStatistics() {
        try {
            Map<String, Object> statistics = applicationService.getApplicationStatistics();
            return ResponseEntity.ok(ApiResponse.success("获取统计信息成功", statistics));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取统计信息失败: " + e.getMessage()));
        }
    }

    /**
     * 获取部门申请统计
     * GET /api/applications/statistics/department
     */
    @GetMapping("/statistics/department")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDepartmentStatistics() {
        try {
            List<Map<String, Object>> statistics = applicationService.getDepartmentStatistics();
            return ResponseEntity.ok(ApiResponse.success("获取部门统计成功", statistics));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取部门统计失败: " + e.getMessage()));
        }
    }

    /**
     * 获取印章使用统计
     * GET /api/applications/statistics/seal-usage
     */
    @GetMapping("/statistics/seal-usage")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSealUsageStatistics() {
        try {
            List<Map<String, Object>> statistics = applicationService.getSealUsageStatistics();
            return ResponseEntity.ok(ApiResponse.success("获取印章使用统计成功", statistics));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取印章使用统计失败: " + e.getMessage()));
        }
    }

    /**
     * 获取月度趋势统计
     * GET /api/applications/statistics/monthly-trend?months=6
     */
    @GetMapping("/statistics/monthly-trend")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMonthlyTrend(
            @RequestParam(defaultValue = "6") int months) {
        try {
            List<Map<String, Object>> trend = applicationService.getMonthlyTrend(months);
            return ResponseEntity.ok(ApiResponse.success("获取月度趋势成功", trend));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取月度趋势失败: " + e.getMessage()));
        }
    }

    /**
     * 获取平均处理时间
     * GET /api/applications/statistics/average-processing-time
     */
    @GetMapping("/statistics/average-processing-time")
    public ResponseEntity<ApiResponse<Double>> getAverageProcessingTime() {
        try {
            Double avgTime = applicationService.getAverageProcessingTime();
            return ResponseEntity.ok(ApiResponse.success("获取平均处理时间成功", avgTime));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取平均处理时间失败: " + e.getMessage()));
        }
    }

    /**
     * 获取即将到期的申请
     * GET /api/applications/upcoming?hours=24
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<SealApplication>>> getUpcomingApplications(
            @RequestParam(defaultValue = "24") int hours) {
        try {
            List<SealApplication> applications = applicationService.getUpcomingApplications(hours);
            return ResponseEntity.ok(ApiResponse.success("获取即将到期申请成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取即将到期申请失败: " + e.getMessage()));
        }
    }

    /**
     * 检查申请是否可以编辑
     * GET /api/applications/{id}/can-edit?applicant=xxx
     */
    @GetMapping("/{id}/can-edit")
    public ResponseEntity<ApiResponse<Boolean>> canEdit(@PathVariable Long id,
            @RequestParam String applicant) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            boolean canEdit = applicationService.canEdit(id, applicant);
            return ResponseEntity.ok(ApiResponse.success("检查完成", canEdit));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "检查权限失败: " + e.getMessage()));
        }
    }

    /**
     * 检查申请是否可以审批
     * GET /api/applications/{id}/can-approve
     */
    @GetMapping("/{id}/can-approve")
    public ResponseEntity<ApiResponse<Boolean>> canApprove(@PathVariable Long id) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            boolean canApprove = applicationService.canApprove(id);
            return ResponseEntity.ok(ApiResponse.success("检查完成", canApprove));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "检查权限失败: " + e.getMessage()));
        }
    }
}