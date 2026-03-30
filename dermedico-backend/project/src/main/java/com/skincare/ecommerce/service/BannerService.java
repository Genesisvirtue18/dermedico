package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.Banner;
import com.skincare.ecommerce.repository.BannerRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class BannerService {

    private final BannerRepository bannerRepository;
    private final FileUploadService fileUploadService;


    public BannerService(
            BannerRepository bannerRepository,
            FileUploadService fileUploadService
    ){
        this.bannerRepository = bannerRepository;
        this.fileUploadService = fileUploadService;
    }



    // Upload Banner
    public Banner uploadBanner(
            MultipartFile file,
            Boolean showOnAllPages
    ) throws Exception {

        String image =
                fileUploadService.upload(file);

        Banner banner = new Banner();

        banner.setImage(image);
        banner.setActive(true);


        // Only ONE global banner allowed
        if(showOnAllPages){

            Banner currentGlobal =
                    bannerRepository.findByShowOnAllPagesTrue();

            if(currentGlobal != null){

                currentGlobal.setShowOnAllPages(false);

                bannerRepository.save(currentGlobal);
            }

            banner.setShowOnAllPages(true);

        }else{

            banner.setShowOnAllPages(false);
        }


        return bannerRepository.save(banner);
    }



    // Get All Banners
    public List<Banner> getAll(){

        return bannerRepository.findAll();
    }



    // Get Global Banner
    public Banner getGlobalBanner(){

        return bannerRepository.findByShowOnAllPagesTrue();
    }



    // Toggle Global Banner
    public Banner toggleGlobal(Long id){

        Banner banner =
                bannerRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Banner not found"));


        // Remove old global banner
        Banner currentGlobal =
                bannerRepository.findByShowOnAllPagesTrue();

        if(currentGlobal != null){

            currentGlobal.setShowOnAllPages(false);

            bannerRepository.save(currentGlobal);
        }


        // Set new global banner
        banner.setShowOnAllPages(true);

        return bannerRepository.save(banner);
    }



    // Delete Banner
    public void delete(Long id){

        Banner banner =
                bannerRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Banner not found"));


        bannerRepository.delete(banner);
    }

}