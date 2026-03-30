package com.skincare.ecommerce.dto;

import lombok.Data;

@Data
public class ShippingAddressDTO {
    private Long id;
    private String recipientName;
    private String phone;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
}
