package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.BlogFaq;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FAQRepo extends JpaRepository<BlogFaq,Long>{

    // ✅ ADD THIS METHOD
    void deleteByBlogId(Long blogId);

}