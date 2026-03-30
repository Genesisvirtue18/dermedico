package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByEmailAndVerifiedFalse(String email);
    void deleteByEmail(String email);
}
