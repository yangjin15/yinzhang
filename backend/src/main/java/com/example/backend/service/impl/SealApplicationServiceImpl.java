package com.example.backend.service.impl;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.SealApplication;
import com.example.backend.repository.SealApplicationRepository;
import com.example.backend.service.SealApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 用印申请服务实现类
 * 实现用印申请管理相关的业务逻辑
 */
@Service
@Transactional
public class SealApplicationServiceImpl implements SealApplicationService {

    @Autowired
    private SealApplicationRepository applicationRepository;

    @Override
    public SealApplication createApplication(SealApplication application) {
        // 设置默认状态
        if (application.getStatus() == null) {
            application.setStatus(SealApplication.ApplicationStatus.PENDING);
        }
        return applicationRepository.save(application);
    }

    @Override
    public SealApplication updateApplication(Long id, SealApplication application) {
        SealApplication existingApplication = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

        // 只有待审批状态的申请才能修改
        if (existingApplication.getStatus() != SealApplication.ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("申请已处理，无法修改");
        }

        // 更新基本信息
        existingApplication.setSealName(application.getSealName());
        existingApplication.setSealType(application.getSealType());
        existingApplication.setPurpose(application.getPurpose());
        existingApplication.setExpectedTime(application.getExpectedTime());
        existingApplication.setDocuments(application.getDocuments());

        return applicationRepository.save(existingApplication);
    }

    @Override
    public void deleteApplication(Long id) {
        SealApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

        // 只有待审批状态的申请才能删除
        if (application.getStatus() != SealApplication.ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("申请已处理，无法删除");
        }

        applicationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SealApplication> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SealApplication> getApplicationByNo(String applicationNo) {
        return applicationRepository.findByApplicationNo(applicationNo);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealApplication> getApplications(Pageable pageable) {
        Page<SealApplication> page = applicationRepository.findAll(pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealApplication> searchApplications(String keyword,
            SealApplication.ApplicationStatus status,
            String applicant,
            String department,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Pageable pageable) {
        Page<SealApplication> page = applicationRepository.findByConditions(
                keyword, status, applicant, department, startTime, endTime, pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealApplication> getMyApplications(String applicant, Pageable pageable) {
        Page<SealApplication> page = applicationRepository.findByApplicant(applicant, pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealApplication> getPendingApplications(Pageable pageable) {
        Page<SealApplication> page = applicationRepository.findPendingApplications(pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealApplication> getCompletedApplications(Pageable pageable) {
        Page<SealApplication> page = applicationRepository.findByStatus(
                SealApplication.ApplicationStatus.COMPLETED, pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getNumber(), page.getSize());
    }

    @Override
    public SealApplication approveApplication(Long id, SealApplication.ApplicationStatus status,
            String approver, String remark) {
        SealApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

        if (application.getStatus() != SealApplication.ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("申请已处理，无法重复审批");
        }

        if (status != SealApplication.ApplicationStatus.APPROVED &&
                status != SealApplication.ApplicationStatus.REJECTED) {
            throw new IllegalArgumentException("无效的审批状态");
        }

        application.setStatus(status);
        application.setApprover(approver);
        application.setApproveTime(LocalDateTime.now());
        application.setApproveRemark(remark);

        return applicationRepository.save(application);
    }

    @Override
    public SealApplication completeApplication(Long id) {
        SealApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

        if (application.getStatus() != SealApplication.ApplicationStatus.APPROVED) {
            throw new IllegalArgumentException("只有已批准的申请才能完成");
        }

        application.setStatus(SealApplication.ApplicationStatus.COMPLETED);
        application.setUpdateTime(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    @Override
    public boolean withdrawApplication(Long id, String applicant) {
        try {
            SealApplication application = applicationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("申请不存在: " + id));

            // 只有申请人可以撤回申请
            if (!application.getApplicant().equals(applicant)) {
                throw new IllegalArgumentException("只有申请人可以撤回申请");
            }

            // 只有待审批状态的申请才能撤回
            if (application.getStatus() != SealApplication.ApplicationStatus.PENDING) {
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
    public List<Map<String, Object>> getDepartmentStatistics() {
        List<Object[]> deptStats = applicationRepository.countByDepartment();
        return deptStats.stream().map(stat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("department", stat[0]);
            map.put("count", stat[1]);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSealUsageStatistics() {
        List<Object[]> sealStats = applicationRepository.countBySealName();
        return sealStats.stream().map(stat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("sealName", stat[0]);
            map.put("usageCount", stat[1]);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlyTrend(int months) {
        LocalDateTime startTime = LocalDateTime.now().minusMonths(months);
        List<Object[]> trendStats = applicationRepository.getMonthlyTrend(startTime);
        return trendStats.stream().map(stat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("month", stat[0]);
            map.put("count", stat[1]);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageProcessingTime() {
        return applicationRepository.getAverageProcessingTime();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SealApplication> getUpcomingApplications(int hours) {
        LocalDateTime deadline = LocalDateTime.now().plusHours(hours);
        return applicationRepository.findUpcomingApplications(deadline);
    }

    @Override
    public int batchApproveApplications(List<Long> ids, SealApplication.ApplicationStatus status,
            String approver, String remark) {
        int count = 0;
        for (Long id : ids) {
            try {
                approveApplication(id, status, approver, remark);
                count++;
            } catch (Exception e) {
                // 忽略错误，继续处理下一个
                System.err.println("批量审批失败: " + id + " - " + e.getMessage());
            }
        }
        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canEdit(Long id, String applicant) {
        Optional<SealApplication> applicationOpt = applicationRepository.findById(id);
        if (applicationOpt.isEmpty()) {
            return false;
        }

        SealApplication application = applicationOpt.get();
        return application.getApplicant().equals(applicant) &&
                application.getStatus() == SealApplication.ApplicationStatus.PENDING;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canApprove(Long id) {
        Optional<SealApplication> applicationOpt = applicationRepository.findById(id);
        if (applicationOpt.isEmpty()) {
            return false;
        }

        SealApplication application = applicationOpt.get();
        return application.getStatus() == SealApplication.ApplicationStatus.PENDING;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SealApplication> getKeeperPendingApplications(String keeper, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SealApplication> applications = applicationRepository.findKeeperPendingApplications(keeper, pageable);
        return new PageResponse<>(applications.getContent(), applications.getTotalElements(),
                applications.getNumber(), applications.getSize());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getApprovalDurationStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        try {
            // 获取平均审批时长（小时）
            Double averageHours = applicationRepository.getAverageProcessingTime();
            statistics.put("averageHours", averageHours != null ? averageHours : 0.0);

            // 转换为更友好的显示格式
            if (averageHours != null && averageHours > 0) {
                int days = (int) (averageHours / 24);
                int hours = (int) (averageHours % 24);
                int minutes = (int) ((averageHours % 1) * 60);

                String durationText = "";
                if (days > 0) {
                    durationText += days + "天";
                }
                if (hours > 0) {
                    durationText += hours + "小时";
                }
                if (minutes > 0) {
                    durationText += minutes + "分钟";
                }
                if (durationText.isEmpty()) {
                    durationText = "不足1分钟";
                }

                statistics.put("averageDurationText", durationText);
            } else {
                statistics.put("averageDurationText", "暂无数据");
            }

            // 统计不同时长范围的申请数量
            List<Object[]> durationRanges = applicationRepository.getApprovalDurationRanges();
            Map<String, Integer> rangeStats = new HashMap<>();
            rangeStats.put("within1Hour", 0); // 1小时内
            rangeStats.put("within1Day", 0); // 1天内
            rangeStats.put("within3Days", 0); // 3天内
            rangeStats.put("within7Days", 0); // 7天内
            rangeStats.put("moreThan7Days", 0); // 超过7天

            for (Object[] range : durationRanges) {
                Double hours = (Double) range[0];
                Long count = (Long) range[1];

                if (hours <= 1) {
                    rangeStats.put("within1Hour", rangeStats.get("within1Hour") + count.intValue());
                } else if (hours <= 24) {
                    rangeStats.put("within1Day", rangeStats.get("within1Day") + count.intValue());
                } else if (hours <= 72) {
                    rangeStats.put("within3Days", rangeStats.get("within3Days") + count.intValue());
                } else if (hours <= 168) {
                    rangeStats.put("within7Days", rangeStats.get("within7Days") + count.intValue());
                } else {
                    rangeStats.put("moreThan7Days", rangeStats.get("moreThan7Days") + count.intValue());
                }
            }

            statistics.put("durationRanges", rangeStats);

            // 获取最快和最慢的审批记录
            Optional<SealApplication> fastest = applicationRepository.findFastestApprovedApplication();
            Optional<SealApplication> slowest = applicationRepository.findSlowestApprovedApplication();

            if (fastest.isPresent()) {
                SealApplication app = fastest.get();
                long fastestMinutes = java.time.Duration.between(app.getApplyTime(), app.getApproveTime()).toMinutes();
                statistics.put("fastestApproval", Map.of(
                        "applicationNo", app.getApplicationNo(),
                        "minutes", fastestMinutes,
                        "text", formatDuration(fastestMinutes)));
            }

            if (slowest.isPresent()) {
                SealApplication app = slowest.get();
                long slowestMinutes = java.time.Duration.between(app.getApplyTime(), app.getApproveTime()).toMinutes();
                statistics.put("slowestApproval", Map.of(
                        "applicationNo", app.getApplicationNo(),
                        "minutes", slowestMinutes,
                        "text", formatDuration(slowestMinutes)));
            }

        } catch (Exception e) {
            // 如果查询失败，返回默认值
            statistics.put("averageHours", 0.0);
            statistics.put("averageDurationText", "数据查询失败");
            statistics.put("durationRanges", Map.of());
        }

        return statistics;
    }

    /**
     * 格式化时长显示
     */
    private String formatDuration(long minutes) {
        if (minutes < 60) {
            return minutes + "分钟";
        } else if (minutes < 1440) {
            long hours = minutes / 60;
            long remainingMinutes = minutes % 60;
            return hours + "小时" + (remainingMinutes > 0 ? remainingMinutes + "分钟" : "");
        } else {
            long days = minutes / 1440;
            long remainingHours = (minutes % 1440) / 60;
            return days + "天" + (remainingHours > 0 ? remainingHours + "小时" : "");
        }
    }
}