package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.entity.Review;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.AuditLogService;
import com.skincare.ecommerce.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/pending")
    public ResponseEntity<Page<Review>> getPendingReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reviewService.getPendingReviews(pageable));
    }

    @PatchMapping("/{reviewId}/moderate")
    public ResponseEntity<?> moderateReview(
            @PathVariable Long reviewId,
            @RequestParam Review.ReviewStatus status,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            Review review = reviewService.moderateReview(reviewId, status);

            auditLogService.log(admin.getId(), admin.getEmail(), "MODERATE_REVIEW", "Review",
                    reviewId, "Changed review status to: " + status, request.getRemoteAddr());

            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
