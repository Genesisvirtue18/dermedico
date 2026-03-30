package com.skincare.ecommerce.controller;


import com.skincare.ecommerce.entity.Banner;
import com.skincare.ecommerce.service.BannerService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@RestController
@RequestMapping("/api/admin/banner")
public class AdminBannerController {

    private final BannerService bannerService;


    public AdminBannerController(
            BannerService bannerService){
        this.bannerService=bannerService;
    }


    // Upload Banner
    @PostMapping("/upload")
    public Banner upload(

            @RequestParam MultipartFile image,
            @RequestParam Boolean showOnAllPages

    ) throws Exception {

        return bannerService.uploadBanner(
                image,
                showOnAllPages
        );
    }


    // All banners
    @GetMapping
    public List<Banner> all(){

        return bannerService.getAll();
    }


    // Single Global Banner
    @GetMapping("/global")
    public Banner global(){

        return bannerService.getGlobalBanner();
    }


    // Toggle Global
    @PutMapping("/toggle/{id}")
    public Banner toggle(
            @PathVariable Long id){

        return bannerService.toggleGlobal(id);
    }


    // Delete
    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id){

        bannerService.delete(id);

        return "Deleted";
    }

}