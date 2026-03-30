package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.Hero;
import com.skincare.ecommerce.repository.HeroRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class HeroService {

    private final HeroRepository heroRepository;
    private final FileUploadService fileUploadService;

    public HeroService(
            HeroRepository heroRepository,
            FileUploadService fileUploadService
    ){
        this.heroRepository=heroRepository;
        this.fileUploadService=fileUploadService;
    }


    // Upload Hero Image
    public Hero uploadHero(
            MultipartFile file)
            throws Exception {

        String imagePath =
                fileUploadService.upload(file);

        Hero hero=new Hero();

        hero.setImage(imagePath);

        return heroRepository.save(hero);
    }


    // Get All Heroes
    public List<Hero> getAllHeroes(){

        return heroRepository.findAll();
    }


    // Delete Hero
    public void deleteHero(Long id){

        Hero hero =
                heroRepository.findById(id)
                        .orElseThrow();

        heroRepository.delete(hero);
    }

}