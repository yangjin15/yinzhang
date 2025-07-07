package com.example.backend.service;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.SealApplication;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 用印申请服务接口
 * 定义用印申请管理相关的业务方法
 */
public interface SealApplicationService {

        /**
         * 创建申请
         * 
         * @param application 申请信息
         * @return 创建的申请
         */
        SealApplication createApplication(SealApplication application);

        /**
         * 更新申请
         * 
         * @param id          申请ID
         * @param application 申请信息
         * @return 更新后的申请
         */
        SealApplication updateApplication(Long id, SealApplication application);

        /**
         * 删除申请
         * 
         * @param id 申请ID
         */
        void deleteApplication(Long id);

        /**
         * 根据ID获取申请
         * 
         * @param id 申请ID
         * @return 申请信息
         */
        Optional<SealApplication> getApplicationById(Long id);

        /**
         * 根据申请编号获取申请
         * 
         * @param applicationNo 申请编号
         * @return 申请信息
         */
        Optional<SealApplication> getApplicationByNo(String applicationNo);

        /**
         * 分页获取申请列表
         * 
         * @param pageable 分页参数
         * @return 申请分页列表
         */
        PageResponse<SealApplication> getApplications(Pageable pageable);

        /**
         * 根据条件搜索申请
         * 
         * @param keyword    搜索关键字
         * @param status     申请状态
         * @param applicant  申请人
         * @param department 部门
         * @param startTime  开始时间
         * @param endTime    结束时间
         * @param pageable   分页参数
         * @return 申请分页列表
         */
        PageResponse<SealApplication> searchApplications(String keyword,
                        SealApplication.ApplicationStatus status,
                        String applicant,
                        String department,
                        LocalDateTime startTime,
                        LocalDateTime endTime,
                        Pageable pageable);

        /**
         * 获取我的申请
         * 
         * @param applicant 申请人
         * @param pageable  分页参数
         * @return 申请分页列表
         */
        PageResponse<SealApplication> getMyApplications(String applicant, Pageable pageable);

        /**
         * 获取待审批申请
         * 
         * @param pageable 分页参数
         * @return 待审批申请列表
         */
        PageResponse<SealApplication> getPendingApplications(Pageable pageable);

        /**
         * 获取已完成申请
         * 
         * @param pageable 分页参数
         * @return 已完成申请列表
         */
        PageResponse<SealApplication> getCompletedApplications(Pageable pageable);

        /**
         * 审批申请
         * 
         * @param id       申请ID
         * @param status   新状态（APPROVED或REJECTED）
         * @param approver 审批人
         * @param remark   审批备注
         * @return 更新后的申请
         */
        SealApplication approveApplication(Long id, SealApplication.ApplicationStatus status,
                        String approver, String remark);

        /**
         * 完成申请（用印完成）
         * 
         * @param id 申请ID
         * @return 更新后的申请
         */
        SealApplication completeApplication(Long id);

        /**
         * 撤回申请
         * 
         * @param id        申请ID
         * @param applicant 申请人（验证权限）
         * @return 是否成功
         */
        boolean withdrawApplication(Long id, String applicant);

        /**
         * 获取申请统计信息
         * 
         * @return 统计信息
         */
        Map<String, Object> getApplicationStatistics();

        /**
         * 获取部门申请统计
         * 
         * @return 部门统计列表
         */
        List<Map<String, Object>> getDepartmentStatistics();

        /**
         * 获取印章使用统计
         * 
         * @return 印章统计列表
         */
        List<Map<String, Object>> getSealUsageStatistics();

        /**
         * 获取月度趋势统计
         * 
         * @param months 月份数
         * @return 趋势统计列表
         */
        List<Map<String, Object>> getMonthlyTrend(int months);

        /**
         * 获取平均处理时间
         * 
         * @return 平均处理时间（小时）
         */
        Double getAverageProcessingTime();

        /**
         * 获取即将到期的申请
         * 
         * @param hours 小时数
         * @return 即将到期的申请列表
         */
        List<SealApplication> getUpcomingApplications(int hours);

        /**
         * 批量审批申请
         * 
         * @param ids      申请ID列表
         * @param status   审批状态
         * @param approver 审批人
         * @param remark   审批备注
         * @return 成功处理的数量
         */
        int batchApproveApplications(List<Long> ids, SealApplication.ApplicationStatus status,
                        String approver, String remark);

        /**
         * 检查申请是否可以编辑
         * 
         * @param id        申请ID
         * @param applicant 申请人
         * @return 是否可编辑
         */
        boolean canEdit(Long id, String applicant);

        /**
         * 检查申请是否可以审批
         * 
         * @param id 申请ID
         * @return 是否可审批
         */
        boolean canApprove(Long id);

        /**
         * 获取特定保管人的待审批申请
         * 
         * @param keeper 保管人
         * @param page   页码
         * @param size   每页大小
         * @return 待审批申请列表
         */
        PageResponse<SealApplication> getKeeperPendingApplications(String keeper, int page, int size);

        /**
         * 获取审批时长统计
         * 
         * @return 审批时长统计信息
         */
        Map<String, Object> getApprovalDurationStatistics();
}