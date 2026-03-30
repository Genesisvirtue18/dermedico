package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.Enum.ConcernGroup;
import com.skincare.ecommerce.entity.Concern;
import com.skincare.ecommerce.repository.ConcernRepository;
import com.skincare.ecommerce.service.ConcernService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/concerns")
@CrossOrigin
public class AdminConcernController {

    private final ConcernService concernService;

    private final ConcernRepository concernRepository;


    public AdminConcernController(ConcernService concernService, ConcernRepository concernRepository) {
        this.concernService = concernService;
        this.concernRepository = concernRepository;
    }

    // ================= CREATE =================
    @PostMapping(consumes = "multipart/form-data")
    public Concern createConcern(
            @RequestParam String name,
            @RequestParam ConcernGroup group,
            @RequestParam String description,
            @RequestParam(required = false) MultipartFile image
    ) {
        return concernService.createConcern(name, group, description, image);
    }


    // ================= READ ALL =================
    @GetMapping
    public List<Concern> getAllConcerns() {
        return concernService.getAllConcerns();
    }

    // ================= READ BY ID =================
    @GetMapping("/{id}")
    public Concern getConcernById(@PathVariable Long id) {
        return concernService.getConcernById(id);
    }

    // ================= UPDATE =================
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public Concern updateConcern(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ConcernGroup group,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile image
    ) {
        return concernService.updateConcern(id, name, group, description, image);
    }

    @DeleteMapping("/{id}")
    public void deleteConcern(@PathVariable Long id) {
        concernService.deleteConcern(id);
    }

    @PostMapping("/generate-slugs")
    public String generateSlugs() {

        List<Concern> concerns = concernRepository.findAll();

        for (Concern concern : concerns) {

            if (concern.getSlug() == null || concern.getSlug().isEmpty()) {

                concern.setSlug(generateSlug(concern.getName()));

            }
        }

        concernRepository.saveAll(concerns);

        return "Concern slugs generated successfully";
    }

    private String generateSlug(String name) {

        String baseSlug = name
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9 ]", "")   // remove special chars
                .replaceAll("\\s+", "-");       // spaces → dash

        // Remove starting and ending dash
        baseSlug = baseSlug.replaceAll("^-+", "").replaceAll("-+$", "");

        String slug = baseSlug;

        int count = 1;

        while (concernRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count;
            count++;
        }

        return slug;
    }}
