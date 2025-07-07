package com.example.backend.service;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.SealCreateApplication;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * 印章创建申请服务接口
 */
public interface SealCreateApplicationService {

    /**
     * 创建印章申请
     */
    SealCreateApplication createApplication(SealCreateApplication application);

    /**
     * 更新印章申请
     */
    SealCreateApplication updateApplication(Long id, SealCreateApplication application);

    /**
     * 删除印章申请
     */
    void deleteApplication(Long id);

    /**
     * 根据ID获取申请
     */
    Optional<SealCreateApplication> getApplicationById(Long id);

    /**
     * 根据申请编号获取申请
     */
    Optional<SealCreateApplication> getApplicationByNo(String applicationNo);

    /**
     * 分页获取申请列表
     */
    PageResponse<SealCreateApplication> getApplications(Pageable pageable);

    /**
     * 根据条件搜索申请
     */
    PageResponse<SealCreateApplication> searchApplications(String keyword,
            SealCreateApplication.ApplicationStatus status,
            String applicant,
            String department,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Pageable pageable);

    /**
     * 获取我的申请
     */
    PageResponse<SealCreateApplication> getMyApplications(String applicant, Pageable pageable);

    /**
     * 获取待审批申请
     */
    PageResponse<SealCreateApplication> getPendingApplications(Pageable pageable);

    /**
     * 审批申请
     */
    SealCreateApplication approveApplication(Long id, SealCreateApplication.ApplicationStatus status,
            String approver, String remark);

    /**
     * 撤回申请
     */
    boolean withdrawApplication(Long id, String applicant);

    /**
     * 获取申请统计信息
     */
    Map<String, Object> getApplicationStatistics();

    /**
     * 检查申请是否可以编辑
     */
    boolean canEdit(Long id, String applicant);

    /**
     * 检查申请是否可以审批
     */
    boolean canApprove(Long id);
}