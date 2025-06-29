package com.example.backend.service.impl;

import com.example.backend.common.PageResponse;
import com.example.backend.entity.Seal;
import com.example.backend.repository.SealRepository;
import com.example.backend.service.SealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 印章服务层实现类
 */
@Service
@Transactional
public class SealServiceImpl implements SealService {

    @Autowired
    private SealRepository sealRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<Seal> findSeals(Integer page, Integer size, String keyword, Seal.SealStatus status) {
        // 创建分页参数，按更新时间倒序排列
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "updateTime"));

        // 根据条件查询
        Page<Seal> sealPage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            sealPage = sealRepository.findByKeywordAndStatus(keyword.trim(), status, pageable);
        } else if (status != null) {
            sealPage = sealRepository.findByStatus(status, pageable);
        } else {
            sealPage = sealRepository.findAll(pageable);
        }

        return new PageResponse<>(
                sealPage.getContent(),
                sealPage.getTotalElements(),
                page,
                size);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Seal> findById(Long id) {
        return sealRepository.findById(id);
    }

    @Override
    public Seal createSeal(Seal seal) {
        // 设置默认状态
        if (seal.getStatus() == null) {
            seal.setStatus(Seal.SealStatus.ACTIVE);
        }
        return sealRepository.save(seal);
    }

    @Override
    public Seal updateSeal(Long id, Seal seal) {
        Optional<Seal> existingSealOpt = sealRepository.findById(id);
        if (existingSealOpt.isEmpty()) {
            throw new RuntimeException("印章不存在，ID: " + id);
        }

        Seal existingSeal = existingSealOpt.get();

        // 更新字段
        if (seal.getName() != null) {
            existingSeal.setName(seal.getName());
        }
        if (seal.getType() != null) {
            existingSeal.setType(seal.getType());
        }
        if (seal.getDescription() != null) {
            existingSeal.setDescription(seal.getDescription());
        }
        if (seal.getKeeper() != null) {
            existingSeal.setKeeper(seal.getKeeper());
        }
        if (seal.getKeeperPhone() != null) {
            existingSeal.setKeeperPhone(seal.getKeeperPhone());
        }
        if (seal.getLocation() != null) {
            existingSeal.setLocation(seal.getLocation());
        }
        if (seal.getImageUrl() != null) {
            existingSeal.setImageUrl(seal.getImageUrl());
        }

        return sealRepository.save(existingSeal);
    }

    @Override
    public void deleteSeal(Long id) {
        if (!sealRepository.existsById(id)) {
            throw new RuntimeException("印章不存在，ID: " + id);
        }
        sealRepository.deleteById(id);
    }

    @Override
    public Seal updateSealStatus(Long id, Seal.SealStatus status) {
        Optional<Seal> sealOpt = sealRepository.findById(id);
        if (sealOpt.isEmpty()) {
            throw new RuntimeException("印章不存在，ID: " + id);
        }

        Seal seal = sealOpt.get();
        seal.setStatus(status);
        return sealRepository.save(seal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Seal> findByKeeper(String keeper) {
        return sealRepository.findByKeeper(keeper);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSealStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // 总数统计
        long totalCount = sealRepository.count();
        statistics.put("total", totalCount);

        // 按状态统计
        List<Object[]> statusCounts = sealRepository.countByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] row : statusCounts) {
            Seal.SealStatus status = (Seal.SealStatus) row[0];
            Long count = (Long) row[1];
            statusMap.put(status.name(), count);
        }
        statistics.put("byStatus", statusMap);

        // 按类型统计
        List<Object[]> typeCounts = sealRepository.countByType();
        Map<String, Long> typeMap = new HashMap<>();
        for (Object[] row : typeCounts) {
            Seal.SealType type = (Seal.SealType) row[0];
            Long count = (Long) row[1];
            typeMap.put(type.name(), count);
        }
        statistics.put("byType", typeMap);

        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return sealRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return sealRepository.findByNameContainingIgnoreCase(name, PageRequest.of(0, 1)).hasContent();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByNameAndIdNot(String name, Long id) {
        Page<Seal> seals = sealRepository.findByNameContainingIgnoreCase(name, PageRequest.of(0, 1));
        return seals.hasContent() && !seals.getContent().get(0).getId().equals(id);
    }
}