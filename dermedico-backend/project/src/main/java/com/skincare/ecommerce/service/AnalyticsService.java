package com.skincare.ecommerce.service;

import com.skincare.ecommerce.dto.AnalyticsResponse;
import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    public AnalyticsResponse getAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        AnalyticsResponse response = new AnalyticsResponse();

        Long totalOrders = orderRepository.count();
        Long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        Long confirmedOrders = orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
        Long shippedOrders = orderRepository.countByStatus(Order.OrderStatus.SHIPPED);
        Long deliveredOrders = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        Long cancelledOrders = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);

        Double totalRevenue = orderRepository.getTotalRevenue(Order.OrderStatus.DELIVERED, startDate, endDate);
        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }

        response.setTotalOrders(totalOrders);
        response.setPendingOrders(pendingOrders);
        response.setConfirmedOrders(confirmedOrders);
        response.setShippedOrders(shippedOrders);
        response.setDeliveredOrders(deliveredOrders);
        response.setCancelledOrders(cancelledOrders);
        response.setTotalRevenue(totalRevenue);

        Map<String, Object> additionalData = new HashMap<>();
        additionalData.put("startDate", startDate);
        additionalData.put("endDate", endDate);
        response.setAdditionalData(additionalData);

        return response;
    }

    public AnalyticsResponse getSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        return getAnalytics(startDate, endDate);
    }
}
