package com.skincare.ecommerce.dto;

import lombok.Data;

@Data
public class AddressRequestDTO {

    private String recipientName;
    private String phone;
    private String street;
    private String landmark;

    private String pincode;
    private String city;
    private String state;

    private boolean isDefault;
}