package com.skincare.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String orderNumber;

    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCharges;
    private BigDecimal discount;
    private BigDecimal totalAmount;

    private String status;
    private String paymentMethod;
    private String trackingNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UserDTO user;
    private ShippingAddressDTO shippingAddress;

    private List<OrderItemDTO> items;


}
