package com.skincare.ecommerce.service;

import com.skincare.ecommerce.Enum.ConcernGroup;
import com.skincare.ecommerce.entity.Concern;
import com.skincare.ecommerce.repository.ConcernRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Service
public class ConcernService {

    private final ConcernRepository concernRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ConcernService(ConcernRepository concernRepository) {
        this.concernRepository = concernRepository;
    }

    /* ================= CREATE (WITH IMAGE) ================= */

    public Concern createConcern(
            String name,
            ConcernGroup group,
            String description,
            MultipartFile image
    ) {
        Concern concern = new Concern();
        concern.setName(name);
        concern.setGroup(group);
        concern.setDescription(description);
        concern.setSlug(generateSlug(name)); // ⭐ ADD
        concern.setActive(true);

        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            concern.setImageUrl(imagePath);
        }

        return concernRepository.save(concern);
    }

    /* ================= READ ALL ================= */

    public List<Concern> getAllConcerns() {
        return concernRepository.findByActiveTrue();
    }

    /* ================= READ BY ID ================= */

    public Concern getConcernById(Long id) {
        return concernRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Concern not found"));
    }

    /* ================= UPDATE ================= */

    public Concern updateConcern(
            Long id,
            String name,
            ConcernGroup group,
            String description,
            MultipartFile image
    ) {
        Concern existing = getConcernById(id);

        // Update fields only if provided
        if (name != null) {
            existing.setName(name);
            existing.setSlug(generateSlug(name)); // ⭐ UPDATE SLUG

        }

        if (group != null) {
            existing.setGroup(group);
        }

        if (description != null) {
            existing.setDescription(description);
        }

        // Handle image update
        if (image != null && !image.isEmpty()) {

            // 1️⃣ Delete old image if exists
            deleteImageIfExists(existing.getImageUrl());

            // 2️⃣ Save new image
            String newImagePath = saveImage(image);
            existing.setImageUrl(newImagePath);
        }

        return concernRepository.save(existing);
    }

    /* ================= DELETE (SOFT + IMAGE DELETE) ================= */

    public void deleteConcern(Long id) {
        Concern concern = getConcernById(id);

        // Soft delete
        concern.setActive(false);

        // Delete image from folder
        deleteImageIfExists(concern.getImageUrl());

        concernRepository.save(concern);
    }


    private void deleteImageIfExists(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // imageUrl = "/12345_image.jpg"
            String fileName = imageUrl.startsWith("/")
                    ? imageUrl.substring(1)
                    : imageUrl;

            Path filePath = Paths.get(uploadDir).resolve(fileName);

            Files.deleteIfExists(filePath);

        } catch (IOException e) {
            // Log but don't break business flow
            System.err.println("Failed to delete image: " + e.getMessage());
        }
    }

    /* ================= READ BY GROUP ================= */

    public List<Concern> getConcernsByGroup(ConcernGroup group) {
        return concernRepository.findByGroupAndActiveTrue(group);
    }

    /* ================= IMAGE STORAGE ================= */

    private String saveImage(MultipartFile file) {
        try {
            String fileName =
                    System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Stored path used directly by frontend
            return "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store image", e);
        }
    }

    private String generateSlug(String name) {

        String baseSlug = name
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        String slug = baseSlug;
        int count = 1;

        while (concernRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count;
            count++;
        }

        return slug;
    }
}
