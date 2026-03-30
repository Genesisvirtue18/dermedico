package com.skincare.ecommerce.entity;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name="blogs")
@Data
public class Blog {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;


    private String title;

    private String subtitle;

    private String heading;

    @Column(columnDefinition="TEXT")
    private String content;


    private String mainImage;


    private String authorName;

    @Column(columnDefinition="TEXT")
    private String authorDescription;

    private String authorPhoto;


    private String slug;

    private String metaTitle;

    private String metaDescription;

    private LocalDateTime createdAt;



    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;


    @OneToMany(mappedBy="blog",
            cascade=CascadeType.ALL)
    @JsonManagedReference
    private List<BlogFaq> faqs;


    @OneToMany(mappedBy="blog",
            cascade=CascadeType.ALL)
    @JsonManagedReference
    private List<BlogTag> tags;

}