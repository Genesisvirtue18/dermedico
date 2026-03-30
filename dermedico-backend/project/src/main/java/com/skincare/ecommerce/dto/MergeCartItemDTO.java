package com.skincare.ecommerce.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MergeCartItemDTO {

    private Long productId;
    private Integer quantity;

}
