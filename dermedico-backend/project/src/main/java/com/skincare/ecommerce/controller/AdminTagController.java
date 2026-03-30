package com.skincare.ecommerce.controller;


import com.skincare.ecommerce.entity.BlogTag;
import com.skincare.ecommerce.repository.TagRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/blog-tags")
@RequiredArgsConstructor
@CrossOrigin
public class AdminTagController {

    private final TagRepo repo;


    // ✅ CREATE TAG
    @PostMapping
    public BlogTag createTag(@RequestBody BlogTag tag){

        return repo.save(tag);

    }

    // ✅ GET ALL TAGS
    @GetMapping
    public List<BlogTag> getAllTags(){

        return repo.findAll();

    }


    // ✅ GET TAG BY ID
    @GetMapping("/{id}")
    public BlogTag getTag(
            @PathVariable Long id
    ){

        return repo.findById(id).orElseThrow();

    }


    // ✅ UPDATE TAG
    @PutMapping("/{id}")
    public BlogTag updateTag(

            @PathVariable Long id,
            @RequestBody BlogTag tag

    ){

        BlogTag existing = repo.findById(id).orElseThrow();

        existing.setTagName(tag.getTagName());

        return repo.save(existing);

    }


    // ✅ DELETE TAG
    @DeleteMapping("/{id}")
    public String deleteTag(
            @PathVariable Long id
    ){

        repo.deleteById(id);

        return "Tag Deleted";

    }

}