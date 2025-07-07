package com.example.backend.service.impl;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.Seal;
import com.example.backend.entity.SealCreateApplication;
import com.example.backend.repository.SealCreateApplicationRepository;
import com.example.backend.service.SealCreateApplicationService;
import com.example.backend.service.SealService;
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
 * 印章创建申请服务实现类
 */
@Service
@Transactional
public class SealCreateApplicationServiceImpl implements SealCreateApplicationService {

    @Autowired
    private SealCreateApplicationRepository applicationRepository;

    @Autowired
    private SealService sealService;

    @Override
    public SealCreateApplication createApplication(SealCreateApplication application) {
        // 设置默认状态
        if (application.getStatus() == null) {
            application.setStatus(SealCreateApplication.ApplicationStatus.PENDING);
        }
        return applicationRepository.save(application);
    }

    @Override
    public SealCreateApplication updateApplication(Long id, SealCreateApplication application) {
        SealCreateApplication existingApplication = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

        // 只有待审批状态的申请才能修改
        if (existingApplication.getStatus() != SealCreateApplication.ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("申请已处理，无法修改");
        }

        // 更新基本信息
        existingApplication.setSealName(application.getSealName());
        existingApplication.setSealType(application.getSealType());
        existingApplication.setSealShape(application.getSealShape());
        existingApplication.setOwnerDepartment(application.getOwnerDepartment());
        existingApplication.setKeeperDepartment(application.getKeeperDepartment());
        existingApplication.setKeeper(application.getKeeper());
        existingApplication.setDescription(application.getDescription());

        return applicationRepository.save(existingApplication);
    }

    @Override
    public void deleteApplication(Long id) {
        SealCreateApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

        // 只有待审批状态的申请才能删除
        if (application.getStatus() != SealCreateApplication.ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("申请已处理，无法删除");
        }

        applicationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SealCreateApplication> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SealCreateApplication> getApplicationByNo(String applicationNo) {
        return applicationRepository.findByApplicationNo(applicationNo);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealCreateApplication> getApplications(Pageable pageable) {
        Page<SealCreateApplication> page = applicationRepository.findAll(pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealCreateApplication> searchApplications(String keyword,
            SealCreateApplication.ApplicationStatus status,
            String applicant,
            String department,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Pageable pageable) {
        Page<SealCreateApplication> page = applicationRepository.findByConditions(
                keyword, status, applicant, department, startTime, endTime, pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealCreateApplication> getMyApplications(String applicant, Pageable pageable) {
        Page<SealCreateApplication> page = applicationRepository.findByApplicant(applicant, pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealCreateApplication> getPendingApplications(Pageable pageable) {
        Page<SealCreateApplication> page = applicationRepository.findPendingApplications(pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    public SealCreateApplication approveApplication(Long id, SealCreateApplication.ApplicationStatus status,
            String approver, String remark) {
        SealCreateApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

        if (application.getStatus() != SealCreateApplication.ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("申请已处理，无法重复审批");
        }

        if (status != SealCreateApplication.ApplicationStatus.APPROVED &&
                status != SealCreateApplication.ApplicationStatus.REJECTED) {
            throw new IllegalArgumentException("无效的审批状态");
        }

        application.setStatus(status);
        application.setApprover(approver);
        application.setApproveTime(LocalDateTime.now());
        application.setApproveRemark(remark);

        // 如果审批通过，创建实际的印章
        if (status == SealCreateApplication.ApplicationStatus.APPROVED) {
            Seal seal = new Seal();
            seal.setName(application.getSealName());
            seal.setType(application.getSealType());
            seal.setShape(application.getSealShape());
            seal.setOwnerDepartment(application.getOwnerDepartment());
            seal.setKeeperDepartment(application.getKeeperDepartment());
            seal.setKeeper(application.getKeeper());
            seal.setDescription(application.getDescription());
            seal.setStatus(Seal.SealStatus.IN_USE);

            sealService.createSeal(seal);
        }

        return applicationRepository.save(application);
    }

    @Override
    public boolean withdrawApplication(Long id, String applicant) {
        try {
            SealCreateApplication application = applicationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

            // 只有申请人可以撤回申请
            if (!application.getApplicant().equals(applicant)) {
                throw new IllegalArgumentException("只有申请人可以撤回申请");
            }

            // 只有待审批状态的申请才能撤回
            if (application.getStatus() != SealCreateApplication.ApplicationStatus.PENDING) {
                throw new IllegalArgumentException("申请已处理，无法撤回");
            }

            applicationRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getApplicationStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // 总申请数
        long totalApplications = applicationRepository.count();
        statistics.put("totalApplications", totalApplications);

        // 按状态统计
        List<Object[]> statusStats = applicationRepository.countByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] stat : statusStats) {
            statusMap.put(stat[0].toString(), (Long) stat[1]);
        }
        statistics.put("byStatus", statusMap);

        // 平均处理时间
        Double avgProcessingTime = applicationRepository.getAverageProcessingTime();
        statistics.put("averageProcessingTime", avgProcessingTime != null ? avgProcessingTime : 0.0);

        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canEdit(Long id, String applicant) {
        Optional<SealCreateApplication> applicationOpt = applicationRepository.findById(id);
        if (applicationOpt.isEmpty()) {
            return false;
        }

        SealCreateApplication application = applicationOpt.get();
        return application.getApplicant().equals(applicant) &&
                application.getStatus() == SealCreateApplication.ApplicationStatus.PENDING;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canApprove(Long id) {
        Optional<SealCreateApplication> applicationOpt = applicationRepository.findById(id);
        if (applicationOpt.isEmpty()) {
            return false;
        }

        SealCreateApplication application = applicationOpt.get();
        return application.getStatus() == SealCreateApplication.ApplicationStatus.PENDING;
    }
}