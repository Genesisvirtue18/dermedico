package com.skincare.ecommerce.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private String mainImage;
    private Integer stockQuantity;
}
