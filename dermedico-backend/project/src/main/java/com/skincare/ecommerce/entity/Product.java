package com.skincare.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private String size;

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "main_image")
    private String mainImage;

    @Column(name = "thumbnail_images", columnDefinition = "TEXT")
    private String thumbnailImages;

    @Column(name = "banner_images", columnDefinition = "TEXT")
    private String bannerImages;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType type = ProductType.SINGLE;

    @Embedded
    private ProductSpecifications specifications;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;   // ✅ MOVED HERE


    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean trending = false;

    @Column(nullable = false)
    private boolean topSeller = false;

    @Column(nullable = false)
    private Integer priorityRank = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToMany
    @JoinTable(
            name = "product_concerns",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "concern_id")
    )
    private Set<Concern> concerns = new HashSet<>();



    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ProductType {
        SINGLE, COMBO, GIFT
    }


    @Column(unique = true)
    private String slug;
}
