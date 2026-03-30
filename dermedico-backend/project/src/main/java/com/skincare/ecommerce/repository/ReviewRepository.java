package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.Review;
import com.skincare.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductAndStatus(Product product, Review.ReviewStatus status);
    Page<Review> findByProductAndStatus(Product product, Review.ReviewStatus status, Pageable pageable);
    Optional<Review> findByUserAndProduct(User user, Product product);
    boolean existsByUserAndProduct(User user, Product product);
    Page<Review> findByStatus(Review.ReviewStatus status, Pageable pageable);
}
