package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.dto.OrderResponseDTO;
import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.AdminService;
import com.skincare.ecommerce.service.AuditLogService;
import com.skincare.ecommerce.service.OrderService;
import com.skincare.ecommerce.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/track")
    public ResponseEntity<?> trackOrder(@RequestParam String trackingNumber) {
        try {
            OrderResponseDTO orderDTO = orderService.getOrderByTrackingNumberDTO(trackingNumber);
            return ResponseEntity.ok(orderDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }



   /* @GetMapping
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Order.OrderStatus status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status, pageable));
        }

        return ResponseEntity.ok(adminService.getAllOrders(pageable));
    }*/

    @GetMapping
    public ResponseEntity<Page<OrderResponseDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Order.OrderStatus status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status, pageable));
        }

        return ResponseEntity.ok(adminService.getAllOrders(pageable));
    }


    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            Order order = orderService.updateOrderStatus(orderId, status);

            auditLogService.log(admin.getId(), admin.getEmail(), "UPDATE_ORDER_STATUS", "Order",
                    orderId, "Changed status to: " + status, request.getRemoteAddr());

            return ResponseEntity.ok(new ApiResponse(true, "Order status updated to " + status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{orderId}/tracking")
    public ResponseEntity<?> updateTrackingNumber(
            @PathVariable Long orderId,
            @RequestParam String trackingNumber,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            Order order = orderService.updateTrackingNumber(orderId, trackingNumber);

            auditLogService.log(admin.getId(), admin.getEmail(), "UPDATE_TRACKING", "Order",
                    orderId, "Updated tracking number: " + trackingNumber, request.getRemoteAddr());

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/refund")
    public ResponseEntity<?> processRefund(
            @PathVariable Long orderId,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            paymentService.processRefund(orderId);

            auditLogService.log(admin.getId(), admin.getEmail(), "REFUND", "Order",
                    orderId, "Processed refund for order", request.getRemoteAddr());

            return ResponseEntity.ok(new ApiResponse(true, "Refund processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
