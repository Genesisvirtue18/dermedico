package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.dto.OrderResponseDTO;
import com.skincare.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/order/track")
public class TrackController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<?> trackOrder(@RequestParam String trackingNumber) {
        try {
            OrderResponseDTO orderDTO = orderService.getOrderByTrackingNumberDTO(trackingNumber);
            return ResponseEntity.ok(orderDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
