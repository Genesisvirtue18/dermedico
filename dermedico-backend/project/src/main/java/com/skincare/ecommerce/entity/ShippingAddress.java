//package com.skincare.ecommerce.entity;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Table(name = "shipping_addresses")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class ShippingAddress {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", nullable = false)
//    @JsonBackReference
//    private User user;
//
//    @Column(nullable = false)
//    private String recipientName;
//
//    @Column(nullable = false)
//    private String phone;
//
//    @Column(nullable = false)
//    private String street;
//
//    @Column(nullable = false)
//    private String city;
//
//    @Column(nullable = false)
//    private String state;
//
//    @Column(nullable = false)
//    private String pincode;
//
//    private String landmark;
//
//    @Column(nullable = false)
//    private boolean isDefault = false;
//}

package com.skincare.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shipping_addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String street;

    private String landmark;

    @Column(nullable = false)
    private boolean isDefault = false;

    // 🔥 NEW RELATION
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pincode_delivery_id", nullable = false)
    private PincodeDelivery pincodeDelivery;
}
