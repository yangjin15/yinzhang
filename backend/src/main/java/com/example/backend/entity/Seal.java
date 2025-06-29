package com.example.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 印章实体类
 */
@Entity
@Table(name = "seals")
public class Seal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SealType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SealStatus status;

    @Column(length = 500)
    private String description;

    @Column(length = 255)
    private String imageUrl;

    @Column(length = 100)
    private String keeper;

    @Column(length = 20)
    private String keeperPhone;

    @Column(length = 200)
    private String location;

    @CreationTimestamp
    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime;

    // 印章类型枚举
    public enum SealType {
        OFFICIAL("公章"),
        FINANCE("财务章"),
        CONTRACT("合同章"),
        PERSONAL("个人印章");

        private final String description;

        SealType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // 印章状态枚举
    public enum SealStatus {
        ACTIVE("正常使用"),
        INACTIVE("暂停使用"),
        DAMAGED("损坏"),
        LOST("遗失");

        private final String description;

        SealStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // 构造函数
    public Seal() {
    }

    public Seal(String name, SealType type, String keeper, String keeperPhone, String location) {
        this.name = name;
        this.type = type;
        this.keeper = keeper;
        this.keeperPhone = keeperPhone;
        this.location = location;
        this.status = SealStatus.ACTIVE;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SealType getType() {
        return type;
    }

    public void setType(SealType type) {
        this.type = type;
    }

    public SealStatus getStatus() {
        return status;
    }

    public void setStatus(SealStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getKeeper() {
        return keeper;
    }

    public void setKeeper(String keeper) {
        this.keeper = keeper;
    }

    public String getKeeperPhone() {
        return keeperPhone;
    }

    public void setKeeperPhone(String keeperPhone) {
        this.keeperPhone = keeperPhone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}