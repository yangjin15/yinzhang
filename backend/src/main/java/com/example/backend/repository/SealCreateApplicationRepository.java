package com.example.backend.repository;

import com.example.backend.entity.SealCreateApplication;
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
 * 印章创建申请数据访问接口
 */
@Repository
public interface SealCreateApplicationRepository extends JpaRepository<SealCreateApplication, Long> {

    /**
     * 根据申请编号查找申请
     */
    Optional<SealCreateApplication> findByApplicationNo(String applicationNo);

    /**
     * 根据申请人查找申请
     */
    Page<SealCreateApplication> findByApplicant(String applicant, Pageable pageable);

    /**
     * 根据申请状态查找申请
     */
    Page<SealCreateApplication> findByStatus(SealCreateApplication.ApplicationStatus status, Pageable pageable);

    /**
     * 根据申请部门查找申请
     */
    Page<SealCreateApplication> findByApplicantDepartment(String department, Pageable pageable);

    /**
     * 查找待审批的申请
     */
    @Query("SELECT sca FROM SealCreateApplication sca WHERE sca.status = 'PENDING' ORDER BY sca.applyTime ASC")
    Page<SealCreateApplication> findPendingApplications(Pageable pageable);

    /**
     * 复合条件查询申请
     */
    @Query("SELECT sca FROM SealCreateApplication sca WHERE " +
            "(:keyword IS NULL OR sca.applicationNo LIKE %:keyword% OR sca.sealName LIKE %:keyword% OR sca.applicant LIKE %:keyword%) "
            +
            "AND (:status IS NULL OR sca.status = :status) " +
            "AND (:applicant IS NULL OR sca.applicant = :applicant) " +
            "AND (:department IS NULL OR sca.applicantDepartment = :department) " +
            "AND (:startTime IS NULL OR sca.applyTime >= :startTime) " +
            "AND (:endTime IS NULL OR sca.applyTime <= :endTime)")
    Page<SealCreateApplication> findByConditions(@Param("keyword") String keyword,
            @Param("status") SealCreateApplication.ApplicationStatus status,
            @Param("applicant") String applicant,
            @Param("department") String department,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable);

    /**
     * 统计申请数量按状态
     */
    @Query("SELECT sca.status, COUNT(sca) FROM SealCreateApplication sca GROUP BY sca.status")
    List<Object[]> countByStatus();

    /**
     * 统计申请数量按部门
     */
    @Query("SELECT sca.applicantDepartment, COUNT(sca) FROM SealCreateApplication sca GROUP BY sca.applicantDepartment")
    List<Object[]> countByDepartment();

    /**
     * 计算平均处理时间
     */
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, sca.applyTime, sca.approveTime)) " +
            "FROM SealCreateApplication sca " +
            "WHERE sca.approveTime IS NOT NULL")
    Double getAverageProcessingTime();
}