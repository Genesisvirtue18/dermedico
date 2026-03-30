package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.entity.UserContact;
import com.skincare.ecommerce.service.UserContactServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class UserContactController {

    @Autowired
    private UserContactServiceImpl userContactService;

    @PostMapping
    public ResponseEntity<?> createContact(@RequestBody UserContact contact) {

        UserContact savedContact = userContactService.saveContact(contact);

        return ResponseEntity.ok("Message submitted successfully");
    }
}