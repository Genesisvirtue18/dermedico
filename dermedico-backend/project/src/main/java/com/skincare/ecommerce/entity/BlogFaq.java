package com.skincare.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name="blog_faq")
@Data
public class BlogFaq {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    private String question;

    private String answer;

    @ManyToOne
    @JoinColumn(name="blog_id")
    @JsonBackReference   // 🔥 REQUIRED
    private Blog blog;

}