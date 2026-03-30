package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.UserContact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserContactRepository extends JpaRepository<UserContact, Long> {
}