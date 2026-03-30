package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByActiveTrue();
    boolean existsBySlug(String slug);
}
