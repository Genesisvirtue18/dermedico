package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.Review;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.ProductRepository;
import com.skincare.ecommerce.repository.ReviewRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    private static final long EDIT_WINDOW_HOURS = 24;

    @Transactional
    public Review createReview(User user, Long productId, Integer rating, String title, String comment) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (reviewRepository.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(rating);
        review.setTitle(title);
        review.setComment(comment);
        review.setStatus(Review.ReviewStatus.PENDING);

        return reviewRepository.save(review);
    }

    @Transactional
    public Review updateReview(User user, Long reviewId, Integer rating, String title, String comment) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        LocalDateTime editDeadline = review.getCreatedAt().plusHours(EDIT_WINDOW_HOURS);
        if (LocalDateTime.now().isAfter(editDeadline)) {
            throw new RuntimeException("Edit window expired. Reviews can only be edited within 24 hours.");
        }

        review.setRating(rating);
        review.setTitle(title);
        review.setComment(comment);
        review.setStatus(Review.ReviewStatus.PENDING);

        return reviewRepository.save(review);
    }

    public List<Review> getApprovedReviewsByProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.findByProductAndStatus(product, Review.ReviewStatus.APPROVED);
    }

    public Page<Review> getApprovedReviewsByProduct(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.findByProductAndStatus(product, Review.ReviewStatus.APPROVED, pageable);
    }

    public Page<Review> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByStatus(Review.ReviewStatus.PENDING, pageable);
    }

    @Transactional
    public Review moderateReview(Long reviewId, Review.ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setStatus(status);
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        reviewRepository.delete(review);
    }
}
