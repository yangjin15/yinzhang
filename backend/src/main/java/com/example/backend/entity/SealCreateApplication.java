package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 印章创建申请实体类
 * 用于管理印章创建的审核流程
 */
@Entity
@Table(name = "seal_create_applications")
public class SealCreateApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String applicationNo;

    @Column(nullable = false, length = 100)
    private String sealName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Seal.SealType sealType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Seal.SealShape sealShape;

    @Column(nullable = false, length = 100)
    private String ownerDepartment;

    @Column(nullable = false, length = 100)
    private String keeperDepartment;

    @Column(nullable = false, length = 50)
    private String keeper;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 50)
    private String applicant;

    @Column(nullable = false, length = 100)
    private String applicantDepartment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(length = 50)
    private String approver;

    private LocalDateTime approveTime;

    @Column(length = 500)
    private String approveRemark;

    @Column(updatable = false)
    private LocalDateTime applyTime;

    private LocalDateTime updateTime;

    /**
     * 申请状态枚举
     */
    public enum ApplicationStatus {
        PENDING("待审批"),
        APPROVED("已批准"),
        REJECTED("已拒绝");

        private final String description;

        ApplicationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    @PrePersist
    protected void onCreate() {
        applyTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
        if (applicationNo == null) {
            applicationNo = generateApplicationNo();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    /**
     * 生成申请编号
     */
    private String generateApplicationNo() {
        return "SC" + System.currentTimeMillis() % 1000000;
    }

    // 无参构造函数
    public SealCreateApplication() {
    }

    // 构造函数
    public SealCreateApplication(String sealName, Seal.SealType sealType, Seal.SealShape sealShape,
            String ownerDepartment, String keeperDepartment, String keeper,
            String description, String applicant, String applicantDepartment) {
        this.sealName = sealName;
        this.sealType = sealType;
        this.sealShape = sealShape;
        this.ownerDepartment = ownerDepartment;
        this.keeperDepartment = keeperDepartment;
        this.keeper = keeper;
        this.description = description;
        this.applicant = applicant;
        this.applicantDepartment = applicantDepartment;
        this.status = ApplicationStatus.PENDING;
    }

    // Getter 和 Setter 方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationNo() {
        return applicationNo;
    }

    public void setApplicationNo(String applicationNo) {
        this.applicationNo = applicationNo;
    }

    public String getSealName() {
        return sealName;
    }

    public void setSealName(String sealName) {
        this.sealName = sealName;
    }

    public Seal.SealType getSealType() {
        return sealType;
    }

    public void setSealType(Seal.SealType sealType) {
        this.sealType = sealType;
    }

    public Seal.SealShape getSealShape() {
        return sealShape;
    }

    public void setSealShape(Seal.SealShape sealShape) {
        this.sealShape = sealShape;
    }

    public String getOwnerDepartment() {
        return ownerDepartment;
    }

    public void setOwnerDepartment(String ownerDepartment) {
        this.ownerDepartment = ownerDepartment;
    }

    public String getKeeperDepartment() {
        return keeperDepartment;
    }

    public void setKeeperDepartment(String keeperDepartment) {
        this.keeperDepartment = keeperDepartment;
    }

    public String getKeeper() {
        return keeper;
    }

    public void setKeeper(String keeper) {
        this.keeper = keeper;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getApplicant() {
        return applicant;
    }

    public void setApplicant(String applicant) {
        this.applicant = applicant;
    }

    public String getApplicantDepartment() {
        return applicantDepartment;
    }

    public void setApplicantDepartment(String applicantDepartment) {
        this.applicantDepartment = applicantDepartment;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getApprover() {
        return approver;
    }

    public void setApprover(String approver) {
        this.approver = approver;
    }

    public LocalDateTime getApproveTime() {
        return approveTime;
    }

    public void setApproveTime(LocalDateTime approveTime) {
        this.approveTime = approveTime;
    }

    public String getApproveRemark() {
        return approveRemark;
    }

    public void setApproveRemark(String approveRemark) {
        this.approveRemark = approveRemark;
    }

    public LocalDateTime getApplyTime() {
        return applyTime;
    }

    public void setApplyTime(LocalDateTime applyTime) {
        this.applyTime = applyTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}