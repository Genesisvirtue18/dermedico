package com.skincare.ecommerce.dto;

import com.skincare.ecommerce.entity.Product;

public class CartItemDTO {

    private Long id;
    private Integer quantity;
    private ProductDTO product; // ✅ CHANGE HERE

    public CartItemDTO(Long id, Integer quantity, ProductDTO product) {
        this.id = id;
        this.quantity = quantity;
        this.product = product;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }
}
