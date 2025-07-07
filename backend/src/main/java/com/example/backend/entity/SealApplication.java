package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 用印申请实体类
 * 用于管理用印申请的详细信息
 */
@Entity
@Table(name = "seal_applications")
public class SealApplication {

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

    @Column(length = 100)
    private String sealOwnerDepartment;

    @Column(length = 100)
    private String sealKeeperDepartment;

    @Column(nullable = false, length = 100)
    private String applicant;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 200)
    private String fileName;

    @Column(length = 200)
    private String addressee;

    @Column
    private Integer copies;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String purpose;

    @Column(length = 500)
    private String attachmentUrl;

    @Column(length = 500)
    private String attachmentName;

    private LocalDateTime expectedTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(length = 100)
    private String approver;

    private LocalDateTime approveTime;

    @Column(columnDefinition = "TEXT")
    private String approveRemark;

    @Column(length = 500)
    private String documents;

    @Column(updatable = false)
    private LocalDateTime applyTime;

    private LocalDateTime updateTime;

    /**
     * 申请状态枚举
     */
    public enum ApplicationStatus {
        PENDING("待审批"),
        APPROVED("已批准"),
        REJECTED("已拒绝"),
        COMPLETED("已完成");

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
        // 自动生成申请编号
        if (applicationNo == null || applicationNo.isEmpty()) {
            applicationNo = generateApplicationNo();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }

    /**
     * 生成申请编号
     * 格式：YY + 年月日 + 4位序号
     */
    private String generateApplicationNo() {
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd");
        String dateStr = LocalDateTime.now().format(formatter);
        // 简单的序号生成，实际项目中可能需要更复杂的逻辑
        int sequence = (int) (Math.random() * 9999) + 1;
        return "YY" + dateStr + String.format("%04d", sequence);
    }

    // 无参构造函数
    public SealApplication() {
    }

    // 构造函数
    public SealApplication(String sealName, Seal.SealType sealType, Seal.SealShape sealShape,
            String sealOwnerDepartment, String sealKeeperDepartment, String applicant,
            String department, String fileName, String addressee, Integer copies,
            String purpose, LocalDateTime expectedTime) {
        this.sealName = sealName;
        this.sealType = sealType;
        this.sealShape = sealShape;
        this.sealOwnerDepartment = sealOwnerDepartment;
        this.sealKeeperDepartment = sealKeeperDepartment;
        this.applicant = applicant;
        this.department = department;
        this.fileName = fileName;
        this.addressee = addressee;
        this.copies = copies;
        this.purpose = purpose;
        this.expectedTime = expectedTime;
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

    public String getSealOwnerDepartment() {
        return sealOwnerDepartment;
    }

    public void setSealOwnerDepartment(String sealOwnerDepartment) {
        this.sealOwnerDepartment = sealOwnerDepartment;
    }

    public String getSealKeeperDepartment() {
        return sealKeeperDepartment;
    }

    public void setSealKeeperDepartment(String sealKeeperDepartment) {
        this.sealKeeperDepartment = sealKeeperDepartment;
    }

    public String getApplicant() {
        return applicant;
    }

    public void setApplicant(String applicant) {
        this.applicant = applicant;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getAddressee() {
        return addressee;
    }

    public void setAddressee(String addressee) {
        this.addressee = addressee;
    }

    public Integer getCopies() {
        return copies;
    }

    public void setCopies(Integer copies) {
        this.copies = copies;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }

    public LocalDateTime getExpectedTime() {
        return expectedTime;
    }

    public void setExpectedTime(LocalDateTime expectedTime) {
        this.expectedTime = expectedTime;
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

    public String getDocuments() {
        return documents;
    }

    public void setDocuments(String documents) {
        this.documents = documents;
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