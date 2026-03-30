package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.UserContact;
import com.skincare.ecommerce.repository.UserContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserContactServiceImpl {

    @Autowired
    private UserContactRepository repository;

    @Autowired
    private UserContactRepository userContactRepository;
    public UserContact saveContact(UserContact contact) {
        return userContactRepository.save(contact);
    }

    // Get All
    public List<UserContact> getAllContacts() {
        return repository.findAll();
    }

    // Get By Id
    public UserContact getContactById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
    }

    // Update (Admin can update full message if needed)
    public UserContact updateContact(Long id, UserContact updatedContact) {
        UserContact contact = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setName(updatedContact.getName());
        contact.setEmail(updatedContact.getEmail());
        contact.setSubject(updatedContact.getSubject());
        contact.setMessage(updatedContact.getMessage());

        return repository.save(contact);
    }

    // Delete
    public void deleteContact(Long id) {
        repository.deleteById(id);
    }
}