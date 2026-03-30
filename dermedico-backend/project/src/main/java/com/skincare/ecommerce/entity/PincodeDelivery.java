package com.skincare.ecommerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "pincode_delivery")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PincodeDelivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String pincode;

    @Column(nullable = false)
    private boolean deliveryAvailable = true;

    @Column(nullable = false)
    private boolean codAvailable = true;

    @Column(nullable = false)
    private Integer estimatedDays = 5;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal shippingCharges = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;


    @Column(nullable = false)
    private String state;

    @Column(nullable = true)
    private String city;
}
