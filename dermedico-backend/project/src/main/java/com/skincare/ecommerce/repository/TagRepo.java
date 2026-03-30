package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.BlogTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepo extends JpaRepository<BlogTag, Long> {

    void deleteByBlogId(Long blogId);

    Optional<BlogTag> findByTagName(String tagName);

}