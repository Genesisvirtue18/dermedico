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
@RequestMapping("/api/admin/blogs")
@RequiredArgsConstructor
public class AdminBlogController {

    private final BlogService blogService;


    @PostMapping(
            value="/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Blog createBlog(

            @RequestPart("data")
            BlogRequest request,

            @RequestPart("mainImage")
            MultipartFile mainImage,

            @RequestPart("authorPhoto")
            MultipartFile authorPhoto

    ) throws Exception {


        return blogService.createBlog(

                request,

                mainImage,
                authorPhoto

        );

    }

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


    // ✅ Update Blog
    @PutMapping(value="/update/{id}",
            consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public Blog updateBlog(

            @PathVariable Long id,

            @RequestPart("data") BlogRequest req,

            @RequestPart(value="mainImage",
                    required=false)
            MultipartFile mainImage,

            @RequestPart(value="authorPhoto",
                    required=false)
            MultipartFile authorPhoto

    ) throws Exception{

        return blogService.updateBlog(
                id,
                req,
                mainImage,
                authorPhoto
        );
    }


    // ✅ Delete Blog
    @DeleteMapping("/{id}")
    public String deleteBlog(
            @PathVariable Long id
    ){

        blogService.deleteBlog(id);

        return "Blog Deleted";
    }

}
