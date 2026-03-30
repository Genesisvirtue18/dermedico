package com.skincare.ecommerce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "hero_section")
public class Hero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String image;

    public Hero() {}

    public Hero(String image) {
        this.image = image;
    }

    public Long getId() {
        return id;
    }

    public String getImage() {
        return image;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setImage(String image) {
        this.image = image;
    }
}