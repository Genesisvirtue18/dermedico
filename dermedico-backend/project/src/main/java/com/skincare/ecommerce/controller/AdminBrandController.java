package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.entity.Brand;
import com.skincare.ecommerce.service.BrandService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@CrossOrigin
public class AdminBrandController {

    private final BrandService brandService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public AdminBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    // ================= CREATE BRAND =================
    @PostMapping(consumes = {"multipart/form-data"})
    public Brand createBrand(
            @RequestPart("brand") Brand brand,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        Path uploadPath = Paths.get(uploadDir, "brands");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        if (image != null && !image.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            brand.setImageUrl("/uploads/brands/" + fileName);
        }

        return brandService.createBrand(brand);
    }

    // ================= GET ALL BRANDS =================
    @GetMapping
    public List<Brand> getAllBrands() {
        return brandService.getAllBrands();
    }

    // ================= GET BRAND BY ID =================
    @GetMapping("/{id}")
    public Brand getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }

    // ================= UPDATE BRAND =================
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public Brand updateBrand(
            @PathVariable Long id,
            @RequestPart(value = "brand", required = false) Brand brand,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        Brand existing = brandService.getBrandById(id);

        // update fields if provided
        if (brand != null) {
            if (brand.getName() != null) {
                existing.setName(brand.getName());
            }
            existing.setActive(brand.isActive());
        }

        // update image if provided
        if (image != null && !image.isEmpty()) {

            // 🔥 DELETE OLD IMAGE
            deleteImageIfExists(existing.getImageUrl());

            Path uploadPath = Paths.get(uploadDir, "brands");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            existing.setImageUrl("/uploads/brands/" + fileName);
        }

        return brandService.updateBrand(id, existing);
    }


    // ================= DELETE BRAND (SOFT DELETE) =================
    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {

        Brand brand = brandService.getBrandById(id);

        // 🔥 DELETE IMAGE FROM FOLDER
        deleteImageIfExists(brand.getImageUrl());

        // soft delete in DB
        brandService.deleteBrand(id);
    }


    private void deleteImageIfExists(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        try {
            // imageUrl example: /uploads/brands/123_logo.png
            String relativePath = imageUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (Exception e) {
            // log but do not break API
            System.err.println("Failed to delete image: " + e.getMessage());
        }
    }

    @PostMapping("/generate-slugs")
    public String generateBrandSlugs(){

        List<Brand> brands = brandService.getAllBrands();

        for(Brand b : brands){

            if(b.getSlug()==null || b.getSlug().isEmpty()){

                String slug = b.getName()
                        .toLowerCase()
                        .replaceAll("[^a-z0-9\\s-]", "")
                        .replaceAll("\\s+", "-");

                int count = 1;
                String uniqueSlug = slug;

                while(brandService.slugExists(uniqueSlug)){
                    uniqueSlug = slug+"-"+count;
                    count++;
                }

                b.setSlug(uniqueSlug);
                brandService.save(b);
            }
        }

        return "Brand slugs generated";
    }

}
