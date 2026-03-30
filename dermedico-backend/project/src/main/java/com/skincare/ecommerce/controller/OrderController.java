package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.dto.CheckoutRequest;
import com.skincare.ecommerce.dto.CheckoutResponse;
import com.skincare.ecommerce.dto.OrderDTO;
import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.OrderService;
import com.skincare.ecommerce.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestBody CheckoutRequest request,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Order order = orderService.createOrder(user, request.getShippingAddressId(), request.getPaymentMethod());

            String razorpayOrderId = null;
            String razorpayKeyId = null;

            if (request.getPaymentMethod() == Order.PaymentMethod.RAZORPAY) {
                razorpayOrderId = paymentService.createRazorpayOrder(order);
                razorpayKeyId = paymentService.getRazorpayKeyId();
            }

            CheckoutResponse response = new CheckoutResponse(
                    order.getOrderNumber(),
                    order.getSubtotal(),
                    order.getTax(),
                    order.getShippingCharges(),
                    order.getDiscount(),
                    order.getTotalAmount(),
                    razorpayOrderId,
                    razorpayKeyId
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();  // print full stack trace
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // ✅ return DTO instead of entity
        Page<OrderDTO> orderDTOs = orderService.getUserOrders(user, pageable);

        return ResponseEntity.ok(orderDTOs);
    }


    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Order order = orderService.getOrderById(orderId);

            if (!order.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Unauthorized access"));
            }

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(
            @PathVariable String orderNumber,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Order order = orderService.getOrderByNumber(orderNumber);

            if (!order.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(new ApiResponse(false, "Unauthorized access"));
            }

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
