package com.skincare.ecommerce.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="blog_tags")
@Data
public class BlogTag {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    private String tagName;

    @ManyToOne
    @JoinColumn(name="blog_id")
    @JsonBackReference   // 🔥 REQUIRED
    private Blog blog;

}
