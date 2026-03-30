package com.skincare.ecommerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDTO(
        Long id,
        String orderNumber,
        BigDecimal subtotal,
        BigDecimal tax,
        BigDecimal totalAmount,
        String status,
        String paymentMethod,
        BigDecimal shippingCharges,
        LocalDateTime createdAt,
        AddressResponseDTO shippingAddress,
        String trackingNumber   ,// ✅ ADD THIS
            List<OrderItemDTO>items   // ✅ ADD THIS


        // ✅ ADD THIS
) {}


