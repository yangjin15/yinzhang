package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.common.PageResponse;
import com.example.backend.entity.SealCreateApplication;
import com.example.backend.service.SealCreateApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * 印章创建申请控制器
 */
@RestController
@RequestMapping("/api/seal-create-applications")
@CrossOrigin(origins = "*")
public class SealCreateApplicationController {

    @Autowired
    private SealCreateApplicationService applicationService;

    /**
     * 创建印章申请
     * POST /api/seal-create-applications
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SealCreateApplication>> createApplication(
            @RequestBody SealCreateApplication application) {
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

            if (application.getSealShape() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("印章形状不能为空"));
            }

            if (application.getOwnerDepartment() == null || application.getOwnerDepartment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("所属部门不能为空"));
            }

            if (application.getKeeperDepartment() == null || application.getKeeperDepartment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("保管部门不能为空"));
            }

            if (application.getKeeper() == null || application.getKeeper().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("保管人不能为空"));
            }

            if (application.getApplicant() == null || application.getApplicant().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("申请人不能为空"));
            }

            if (application.getApplicantDepartment() == null || application.getApplicantDepartment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("申请部门不能为空"));
            }

            SealCreateApplication createdApplication = applicationService.createApplication(application);
            return ResponseEntity.ok(ApiResponse.success("印章申请创建成功", createdApplication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("创建印章申请失败: " + e.getMessage()));
        }
    }

    /**
     * 更新印章申请
     * PUT /api/seal-create-applications/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SealCreateApplication>> updateApplication(@PathVariable Long id,
            @RequestBody SealCreateApplication application) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            SealCreateApplication updatedApplication = applicationService.updateApplication(id, application);
            return ResponseEntity.ok(ApiResponse.success("印章申请更新成功", updatedApplication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("更新印章申请失败: " + e.getMessage()));
        }
    }

    /**
     * 删除印章申请
     * DELETE /api/seal-create-applications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        try {
            if (!applicationService.getApplicationById(id).isPresent()) {
                return ResponseEntity.notFound()
                        .build();
            }

            applicationService.deleteApplication(id);
            return ResponseEntity.ok(ApiResponse.success("印章申请删除成功", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("删除印章申请失败: " + e.getMessage()));
        }
    }

    /**
     * 根据ID获取印章申请
     * GET /api/seal-create-applications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SealCreateApplication>> getApplicationById(@PathVariable Long id) {
        try {
            Optional<SealCreateApplication> application = applicationService.getApplicationById(id);
            if (application.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("获取印章申请信息成功", application.get()));
            } else {
                return ResponseEntity.notFound()
                        .build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取印章申请信息失败: " + e.getMessage()));
        }
    }

    /**
     * 分页获取印章申请列表
     * GET /api/seal-create-applications?page=0&size=10&sort=applyTime,desc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SealCreateApplication>>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applyTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) SealCreateApplication.ApplicationStatus status,
            @RequestParam(required = false) String applicant,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        try {
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            PageResponse<SealCreateApplication> applications;
            if (keyword != null || status != null || applicant != null ||
                    department != null || startTime != null || endTime != null) {
                applications = applicationService.searchApplications(
                        keyword, status, applicant, department, startTime, endTime, pageable);
            } else {
                applications = applicationService.getApplications(pageable);
            }

            return ResponseEntity.ok(ApiResponse.success("获取印章申请列表成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取印章申请列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取我的印章申请
     * GET /api/seal-create-applications/my/{applicant}
     */
    @GetMapping("/my/{applicant}")
    public ResponseEntity<ApiResponse<PageResponse<SealCreateApplication>>> getMyApplications(
            @PathVariable String applicant,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size,
                    Sort.by(Sort.Direction.DESC, "applyTime"));
            PageResponse<SealCreateApplication> applications = applicationService.getMyApplications(applicant,
                    pageable);
            return ResponseEntity.ok(ApiResponse.success("获取我的印章申请成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取我的印章申请失败: " + e.getMessage()));
        }
    }

    /**
     * 获取待审批印章申请
     * GET /api/seal-create-applications/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PageResponse<SealCreateApplication>>> getPendingApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size,
                    Sort.by(Sort.Direction.ASC, "applyTime"));
            PageResponse<SealCreateApplication> applications = applicationService.getPendingApplications(pageable);
            return ResponseEntity.ok(ApiResponse.success("获取待审批印章申请成功", applications));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取待审批印章申请失败: " + e.getMessage()));
        }
    }

    /**
     * 审批印章申请
     * POST /api/seal-create-applications/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SealCreateApplication>> approveApplication(@PathVariable Long id,
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

            SealCreateApplication.ApplicationStatus status;
            try {
                status = SealCreateApplication.ApplicationStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("无效的审批状态: " + statusStr));
            }

            SealCreateApplication updatedApplication = applicationService.approveApplication(id, status, approver,
                    remark);
            return ResponseEntity.ok(ApiResponse.success("印章申请审批成功", updatedApplication));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "印章申请审批失败: " + e.getMessage()));
        }
    }

    /**
     * 撤回印章申请
     * POST /api/seal-create-applications/{id}/withdraw
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
                return ResponseEntity.ok(ApiResponse.success("印章申请撤回成功", null));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("印章申请撤回失败"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.badRequest(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "印章申请撤回失败: " + e.getMessage()));
        }
    }

    /**
     * 获取印章申请统计信息
     * GET /api/seal-create-applications/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApplicationStatistics() {
        try {
            Map<String, Object> statistics = applicationService.getApplicationStatistics();
            return ResponseEntity.ok(ApiResponse.success("获取印章申请统计信息成功", statistics));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(500, "获取印章申请统计信息失败: " + e.getMessage()));
        }
    }

    /**
     * 检查印章申请是否可以编辑
     * GET /api/seal-create-applications/{id}/can-edit?applicant=xxx
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
     * 检查印章申请是否可以审批
     * GET /api/seal-create-applications/{id}/can-approve
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