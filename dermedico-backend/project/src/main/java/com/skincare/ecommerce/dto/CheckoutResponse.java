package com.skincare.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CheckoutResponse {
    private String orderNumber;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCharges;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private String razorpayOrderId;
    private String razorpayKeyId;
}
