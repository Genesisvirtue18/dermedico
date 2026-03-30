package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogRepo
        extends JpaRepository<Blog,Long> {

    Optional<Blog> findBySlug(String slug);

}