package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.dto.OrderResponseDTO;
import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.AdminService;
import com.skincare.ecommerce.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PatchMapping("/{userId}/suspend")
    public ResponseEntity<?> suspendUser(
            @PathVariable Long userId,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            User user = adminService.suspendUser(userId);

            auditLogService.log(admin.getId(), admin.getEmail(), "SUSPEND_USER", "User",
                    userId, "Suspended user: " + user.getEmail(), request.getRemoteAddr());

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{userId}/unblock")
    public ResponseEntity<?> unblockUser(
            @PathVariable Long userId,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            User user = adminService.unblockUser(userId);

            auditLogService.log(admin.getId(), admin.getEmail(), "UNBLOCK_USER", "User",
                    userId, "Unblocked user: " + user.getEmail(), request.getRemoteAddr());

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    /*@GetMapping("/{userId}/orders")
    public ResponseEntity<?> getUserPurchaseHistory(@PathVariable Long userId) {
        try {
            List<Order> orders = adminService.getUserPurchaseHistory(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }*/

    @GetMapping("/{userId}/orders")
    public ResponseEntity<?> getUserPurchaseHistory(@PathVariable Long userId) {
        try {
            List<OrderResponseDTO> orders = adminService.getUserPurchaseHistory(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }


}
