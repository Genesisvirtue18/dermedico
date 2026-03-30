package com.skincare.ecommerce.dto;

import com.skincare.ecommerce.entity.Order;
import lombok.Data;

@Data
public class CheckoutRequest {
    private Long shippingAddressId;
    private Order.PaymentMethod paymentMethod;
}
