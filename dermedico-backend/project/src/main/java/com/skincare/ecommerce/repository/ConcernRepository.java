package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.Enum.ConcernGroup;
import com.skincare.ecommerce.entity.Concern;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConcernRepository extends JpaRepository<Concern, Long> {
    List<Concern> findByActiveTrue();

    List<Concern> findByGroupAndActiveTrue(ConcernGroup group);

    boolean existsBySlug(String slug);
}
