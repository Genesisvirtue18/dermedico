package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.Category;
import com.skincare.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // CREATE
    public Category createCategory(Category category) {
        String slug = generateSlug(category.getName(), null);

        category.setSlug(slug);
        return categoryRepository.save(category);
    }

    // READ ALL
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // READ BY ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    // UPDATE
    public Category updateCategory(Long id, Category updatedCategory) {
        Category category = getCategoryById(id);
        category.setName(updatedCategory.getName());
        category.setImageUrl(updatedCategory.getImageUrl());
        category.setDescription(updatedCategory.getDescription());
        String slug = generateSlug(category.getName(), id);
        category.setSlug(slug);
        return categoryRepository.save(category);
    }

    // DELETE
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }


    private String generateSlug(String name, Long id){

        String baseSlug = name
                .toLowerCase()
                .replaceAll("[^a-z0-9]+","-")
                .replaceAll("(^-|-$)","");

        String slug = baseSlug;

        int counter = 1;

        while(true){

            boolean exists;

            if(id == null){
                exists = categoryRepository.existsBySlug(slug);
            }else{
                exists = categoryRepository.existsBySlugAndIdNot(slug,id);
            }

            if(!exists) break;

            slug = baseSlug + "-" + counter;

            counter++;
        }

        return slug;
    }
}
