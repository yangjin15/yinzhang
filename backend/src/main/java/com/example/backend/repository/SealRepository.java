package com.example.backend.repository;

import com.example.backend.entity.Seal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 印章数据访问层接口
 */
@Repository
public interface SealRepository extends JpaRepository<Seal, Long> {

        /**
         * 检查印章名称是否存在
         */
        boolean existsByName(String name);

        /**
         * 根据印章名称模糊查询
         */
        Page<Seal> findByNameContainingIgnoreCase(String name, Pageable pageable);

        /**
         * 根据印章类型查询
         */
        Page<Seal> findByType(Seal.SealType type, Pageable pageable);

        /**
         * 根据印章状态查询
         */
        Page<Seal> findByStatus(Seal.SealStatus status, Pageable pageable);

        /**
         * 复合条件查询：根据关键字和状态
         */
        @Query("SELECT s FROM Seal s WHERE " +
                        "(:keyword IS NULL OR s.name LIKE %:keyword% OR s.description LIKE %:keyword%) AND " +
                        "(:status IS NULL OR s.status = :status)")
        Page<Seal> findByKeywordAndStatus(@Param("keyword") String keyword,
                        @Param("status") Seal.SealStatus status,
                        Pageable pageable);

        /**
         * 根据保管人查询
         */
        List<Seal> findByKeeper(String keeper);

        /**
         * 根据印章类型和状态查询
         */
        List<Seal> findByTypeAndStatus(Seal.SealType type, Seal.SealStatus status);

        /**
         * 统计各状态的印章数量
         */
        @Query("SELECT s.status, COUNT(s) FROM Seal s GROUP BY s.status")
        List<Object[]> countByStatus();

        /**
         * 统计各类型的印章数量
         */
        @Query("SELECT s.type, COUNT(s) FROM Seal s GROUP BY s.type")
        List<Object[]> countByType();
}