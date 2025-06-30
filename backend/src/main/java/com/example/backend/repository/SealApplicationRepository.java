package com.example.backend.repository;

import com.example.backend.entity.SealApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 用印申请数据访问接口
 * 提供用印申请管理相关的数据库操作方法
 */
@Repository
public interface SealApplicationRepository extends JpaRepository<SealApplication, Long> {

    /**
     * 根据申请编号查找申请
     * 
     * @param applicationNo 申请编号
     * @return 申请对象
     */
    Optional<SealApplication> findByApplicationNo(String applicationNo);

    /**
     * 根据申请人查找申请
     * 
     * @param applicant 申请人
     * @param pageable  分页参数
     * @return 申请分页列表
     */
    Page<SealApplication> findByApplicant(String applicant, Pageable pageable);

    /**
     * 根据申请状态查找申请
     * 
     * @param status   申请状态
     * @param pageable 分页参数
     * @return 申请分页列表
     */
    Page<SealApplication> findByStatus(SealApplication.ApplicationStatus status, Pageable pageable);

    /**
     * 根据部门查找申请
     * 
     * @param department 部门
     * @param pageable   分页参数
     * @return 申请分页列表
     */
    Page<SealApplication> findByDepartment(String department, Pageable pageable);

    /**
     * 根据印章名称查找申请
     * 
     * @param sealName 印章名称
     * @param pageable 分页参数
     * @return 申请分页列表
     */
    Page<SealApplication> findBySealName(String sealName, Pageable pageable);

    /**
     * 根据审批人查找申请
     * 
     * @param approver 审批人
     * @param pageable 分页参数
     * @return 申请分页列表
     */
    Page<SealApplication> findByApprover(String approver, Pageable pageable);

    /**
     * 根据关键字搜索申请（申请编号、用印目的、申请人）
     * 
     * @param keyword  搜索关键字
     * @param pageable 分页参数
     * @return 申请分页列表
     */
    @Query("SELECT sa FROM SealApplication sa WHERE sa.applicationNo LIKE %:keyword% " +
            "OR sa.purpose LIKE %:keyword% OR sa.applicant LIKE %:keyword%")
    Page<SealApplication> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 根据时间范围查找申请
     * 
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @param pageable  分页参数
     * @return 申请分页列表
     */
    @Query("SELECT sa FROM SealApplication sa WHERE sa.applyTime BETWEEN :startTime AND :endTime")
    Page<SealApplication> findByTimeRange(@Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable);

    /**
     * 复合条件查询申请
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
    @Query("SELECT sa FROM SealApplication sa WHERE " +
            "(:keyword IS NULL OR sa.applicationNo LIKE %:keyword% OR sa.purpose LIKE %:keyword% OR sa.applicant LIKE %:keyword%) "
            +
            "AND (:status IS NULL OR sa.status = :status) " +
            "AND (:applicant IS NULL OR sa.applicant = :applicant) " +
            "AND (:department IS NULL OR sa.department = :department) " +
            "AND (:startTime IS NULL OR sa.applyTime >= :startTime) " +
            "AND (:endTime IS NULL OR sa.applyTime <= :endTime)")
    Page<SealApplication> findByConditions(@Param("keyword") String keyword,
            @Param("status") SealApplication.ApplicationStatus status,
            @Param("applicant") String applicant,
            @Param("department") String department,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable);

    /**
     * 统计申请数量按状态
     * 
     * @return 状态统计列表
     */
    @Query("SELECT sa.status, COUNT(sa) FROM SealApplication sa GROUP BY sa.status")
    List<Object[]> countByStatus();

    /**
     * 统计申请数量按部门
     * 
     * @return 部门统计列表
     */
    @Query("SELECT sa.department, COUNT(sa) FROM SealApplication sa GROUP BY sa.department")
    List<Object[]> countByDepartment();

    /**
     * 统计申请数量按印章
     * 
     * @return 印章统计列表
     */
    @Query("SELECT sa.sealName, COUNT(sa) FROM SealApplication sa GROUP BY sa.sealName")
    List<Object[]> countBySealName();

    /**
     * 统计月度申请趋势
     * 
     * @param months 月份数
     * @return 月度统计列表
     */
    @Query("SELECT FUNCTION('DATE_FORMAT', sa.applyTime, '%Y-%m'), COUNT(sa) " +
            "FROM SealApplication sa " +
            "WHERE sa.applyTime >= :months " +
            "GROUP BY FUNCTION('DATE_FORMAT', sa.applyTime, '%Y-%m') " +
            "ORDER BY FUNCTION('DATE_FORMAT', sa.applyTime, '%Y-%m')")
    List<Object[]> getMonthlyTrend(@Param("months") LocalDateTime months);

    /**
     * 计算平均处理时间
     * 
     * @return 平均处理时间（小时）
     */
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, sa.applyTime, sa.approveTime)) " +
            "FROM SealApplication sa " +
            "WHERE sa.approveTime IS NOT NULL")
    Double getAverageProcessingTime();

    /**
     * 查找待审批的申请
     * 
     * @param pageable 分页参数
     * @return 待审批申请列表
     */
    @Query("SELECT sa FROM SealApplication sa WHERE sa.status = 'PENDING' ORDER BY sa.applyTime ASC")
    Page<SealApplication> findPendingApplications(Pageable pageable);

    /**
     * 查找即将到期的申请（期望用印时间）
     * 
     * @param hours 小时数
     * @return 即将到期的申请列表
     */
    @Query("SELECT sa FROM SealApplication sa WHERE sa.status = 'APPROVED' " +
            "AND sa.expectedTime <= :hours")
    List<SealApplication> findUpcomingApplications(@Param("hours") LocalDateTime hours);
}