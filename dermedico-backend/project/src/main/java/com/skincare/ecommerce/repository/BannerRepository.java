package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    // Get active banners
    List<Banner> findByActiveTrue();

    // Get single global banner
    Banner findByShowOnAllPagesTrue();

}