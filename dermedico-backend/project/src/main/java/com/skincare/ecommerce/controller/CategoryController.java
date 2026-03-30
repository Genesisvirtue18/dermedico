package com.skincare.ecommerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skincare.ecommerce.entity.Category;
import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.service.CategoryService;
import com.skincare.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@CrossOrigin
public class CategoryController {

    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    // CREATE CATEGORY
    @PostMapping(consumes = {"multipart/form-data"})
    public Category createCategory(
            @RequestPart("category") String categoryJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {


        ObjectMapper objectMapper = new ObjectMapper();
        Category category = objectMapper.readValue(categoryJson, Category.class);



        Path uploadPath = Paths.get("uploads/categories");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        if (image != null && !image.isEmpty()) {

            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath);

            category.setImageUrl("/uploads/categories/" + fileName);
        }

        Category saved = categoryService.createCategory(category);

        return saved;
    }




    // GET ALL CATEGORIES
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // GET CATEGORY BY ID
    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    // UPDATE CATEGORY
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public Category updateCategory(
            @PathVariable Long id,
            @RequestPart(value = "category", required = false) String categoryJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        Category existingCategory = categoryService.getCategoryById(id);

        // update text fields
        if (categoryJson != null) {
            ObjectMapper mapper = new ObjectMapper();
            Category incoming = mapper.readValue(categoryJson, Category.class);

            if (incoming.getName() != null) {
                existingCategory.setName(incoming.getName());
            }
            if (incoming.getDescription() != null) {
                existingCategory.setDescription(incoming.getDescription());
            }
        }

        // update image
        if (image != null && !image.isEmpty()) {
            Path uploadPath = Paths.get("uploads/categories");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Files.copy(image.getInputStream(), uploadPath.resolve(fileName));

            existingCategory.setImageUrl("/uploads/categories/" + fileName);
        }

        return categoryService.updateCategory(id, existingCategory);
    }


    // DELETE CATEGORY
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }


    @PostMapping("/generate-slugs")
    public String generateSlugs(){

        List<Category> categories = categoryService.getAllCategories();

        for(Category c : categories){

            String slug = c.getName()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9]+","-")
                    .replaceAll("(^-|-$)","");

            c.setSlug(slug);

            categoryService.updateCategory(c.getId(),c);
        }

        return "Category slugs generated successfully";
    }
}
