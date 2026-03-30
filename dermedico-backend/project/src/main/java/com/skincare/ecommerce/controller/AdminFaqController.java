package com.skincare.ecommerce.controller;



import com.skincare.ecommerce.entity.BlogFaq;
import com.skincare.ecommerce.repository.FAQRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/blog-faq")
@RequiredArgsConstructor
@CrossOrigin
public class AdminFaqController {


    @Autowired
    private FAQRepo repo;


    // ✅ GET ALL FAQS
    @GetMapping
    public List<BlogFaq> getAllFaqs(){
        return repo.findAll();
    }


    // ✅ GET FAQ BY ID
    @GetMapping("/{id}")
    public BlogFaq getFaq(@PathVariable Long id){
        return repo.findById(id).orElseThrow();
    }


    // ✅ UPDATE FAQ
    @PutMapping("/{id}")
    public BlogFaq updateFaq(

            @PathVariable Long id,
            @RequestBody BlogFaq faq

    ){

        BlogFaq existing = repo.findById(id).orElseThrow();

        existing.setQuestion(faq.getQuestion());
        existing.setAnswer(faq.getAnswer());

        return repo.save(existing);

    }


    // ✅ DELETE FAQ
    @DeleteMapping("/{id}")
    public String deleteFaq(@PathVariable Long id){

        repo.deleteById(id);

        return "FAQ Deleted";

    }

}