package com.example.backend.service;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.Seal;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 印章服务层接口
 */
public interface SealService {

    /**
     * 分页查询印章列表
     */
    PageResponse<Seal> findSeals(Integer page, Integer size, String keyword, Seal.SealStatus status);

    /**
     * 根据ID查询印章详情
     */
    Optional<Seal> findById(Long id);

    /**
     * 创建印章
     */
    Seal createSeal(Seal seal);

    /**
     * 更新印章信息
     */
    Seal updateSeal(Long id, Seal seal);

    /**
     * 删除印章
     */
    void deleteSeal(Long id);

    /**
     * 更新印章状态
     */
    Seal updateSealStatus(Long id, Seal.SealStatus status);

    /**
     * 根据保管人查询印章
     */
    List<Seal> findByKeeper(String keeper);

    /**
     * 获取印章统计信息
     */
    Map<String, Object> getSealStatistics();

    /**
     * 验证印章是否存在
     */
    boolean existsById(Long id);

    /**
     * 检查印章名称是否重复
     */
    boolean existsByName(String name);

    /**
     * 检查印章名称是否重复（排除指定ID）
     */
    boolean existsByNameAndIdNot(String name, Long id);
}