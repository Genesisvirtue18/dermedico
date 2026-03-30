package com.skincare.ecommerce.entity;

import jakarta.persistence.*;

@Entity
@Table(name="banners")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String image;

    // Only one banner can be global
    private Boolean showOnAllPages = false;

    private Boolean active = true;


    public Long getId() {
        return id;
    }

    public String getImage() {
        return image;
    }

    public Boolean getShowOnAllPages() {
        return showOnAllPages;
    }

    public Boolean getActive() {
        return active;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void setShowOnAllPages(Boolean showOnAllPages) {
        this.showOnAllPages = showOnAllPages;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}