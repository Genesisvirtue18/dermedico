package com.skincare.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class BlogRequest {

    private String title;
    private String subtitle;
    private String heading;
    private String content;

    private String slug;

    private String metaTitle;
    private String metaDescription;

    private Long categoryId;

    private String authorName;
    private String authorDescription;

    private List<String> tags;

    private List<FaqDTO> faqs;

}