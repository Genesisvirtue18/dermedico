package com.skincare.ecommerce.controller;


import com.skincare.ecommerce.entity.Hero;
import com.skincare.ecommerce.service.HeroService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/hero")
@CrossOrigin("*")
public class AdminHeroController {

    private final HeroService heroService;


    public AdminHeroController(HeroService heroService) {
        this.heroService = heroService;
    }


    // Upload
    @PostMapping("/upload")
    public Hero uploadHero(
            @RequestParam MultipartFile image)
            throws Exception{

        return heroService.uploadHero(image);
    }


    // Get All
    @GetMapping
    public List<Hero> getAll(){

        return heroService.getAllHeroes();
    }


    // Delete
    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id){

        heroService.deleteHero(id);

        return "Deleted";
    }

}