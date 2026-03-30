package com.skincare.ecommerce.entity;

import com.skincare.ecommerce.Enum.ConcernGroup;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "concerns")
@Data
public class Concern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "concern_group")
    private ConcernGroup group;// SKIN, HAIR, SUPPLEMENT

    private String description;
    private String imageUrl;

    private boolean active = true;

    @Column(unique = true)
    private String slug; // ⭐ NEW
}
