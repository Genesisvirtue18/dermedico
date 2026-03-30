package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.BlogSection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepo
        extends JpaRepository<BlogSection,Long> {}