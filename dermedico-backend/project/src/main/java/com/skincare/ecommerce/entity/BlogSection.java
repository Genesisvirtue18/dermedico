package com.skincare.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="blog_sections")
@Data
public class BlogSection {

    @Id
    @GeneratedValue
    private Long id;

    private String heading;

    @Column(columnDefinition="TEXT")
    private String content;

    private int displayOrder;

    @ManyToOne
    @JoinColumn(name="blog_id")
    private Blog blog;

}