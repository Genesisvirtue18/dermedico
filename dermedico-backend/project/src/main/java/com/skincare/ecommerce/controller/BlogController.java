package com.skincare.ecommerce.controller;


import com.skincare.ecommerce.dto.BlogRequest;
import com.skincare.ecommerce.entity.Blog;
import com.skincare.ecommerce.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;




    // ✅ Get All Blogs
    @GetMapping
    public List<Blog> getAllBlogs(){
        return blogService.getAllBlogs();
    }


    // ✅ Get Blog By ID
    @GetMapping("/{id}")
    public Blog getBlog(@PathVariable Long id){
        return blogService.getBlog(id);
    }


    // ✅ SEO Friendly URL
    @GetMapping("/slug/{slug}")
    public Blog getBlogBySlug(@PathVariable String slug){
        return blogService.getBySlug(slug);
    }




}