package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.Brand;
import com.skincare.ecommerce.repository.BrandRepository;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {

        this.brandRepository = brandRepository;
    }

    // CREATE
    public Brand createBrand(Brand brand) {
        if(brand.getSlug()==null || brand.getSlug().isEmpty()){
            brand.setSlug(generateSlug(brand.getName()));
        }
        return brandRepository.save(brand);
    }

    // READ ALL
    public List<Brand> getAllBrands() {
        return brandRepository.findByActiveTrue();
    }

    // READ BY ID
    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
    }

    // UPDATE (EDIT ANY FIELD)
    public Brand updateBrand(Long id, Brand brand) {
        Brand existing = getBrandById(id);

        if (brand.getName() != null) {
            existing.setName(brand.getName());
            existing.setSlug(generateSlug(brand.getName()));
        }

        if (brand.getImageUrl() != null) {
            existing.setImageUrl(brand.getImageUrl());
        }

        // allow enable / disable
        existing.setActive(brand.isActive());

        return brandRepository.save(existing);
    }

    // DELETE (SOFT DELETE – recommended)
    public void deleteBrand(Long id) {
        Brand brand = getBrandById(id);
        brand.setActive(false);
        brandRepository.save(brand);
    }

    public String generateSlug(String name) {

        String baseSlug = name
                .trim()                 // ⭐ removes spaces start/end
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");

        // Remove trailing dash
        baseSlug = baseSlug.replaceAll("^-|-$", "");

        return baseSlug;
    }

    public boolean slugExists(String slug){
        return brandRepository.existsBySlug(slug);
    }

    public Brand save(Brand brand){
        return brandRepository.save(brand);
    }
}
