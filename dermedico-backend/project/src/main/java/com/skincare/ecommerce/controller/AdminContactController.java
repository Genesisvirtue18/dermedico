package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.entity.UserContact;
import com.skincare.ecommerce.service.UserContactServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact")
public class AdminContactController {

    @Autowired
    private UserContactServiceImpl userContactService;

    // ✅ Get All Messages
    @GetMapping
    public ResponseEntity<List<UserContact>> getAllContacts() {
        return ResponseEntity.ok(userContactService.getAllContacts());
    }

    // ✅ Get Single Message
    @GetMapping("/{id}")
    public ResponseEntity<UserContact> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(userContactService.getContactById(id));
    }

    // ✅ Update Message
    @PutMapping("/{id}")
    public ResponseEntity<UserContact> updateContact(
            @PathVariable Long id,
            @RequestBody UserContact contact) {

        return ResponseEntity.ok(
                userContactService.updateContact(id, contact)
        );
    }

    // ✅ Delete Message
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
        userContactService.deleteContact(id);
        return ResponseEntity.ok("Contact deleted successfully");
    }
}