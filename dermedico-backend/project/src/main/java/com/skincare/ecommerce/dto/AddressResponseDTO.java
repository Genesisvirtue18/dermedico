package com.skincare.ecommerce.dto;

import lombok.Data;

@Data
public class AddressResponseDTO {
    private Long id;
    private String street;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String recipientName;
    private String landmark;   // ✅ add this
    private boolean isDefault;
}
