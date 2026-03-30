package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.PincodeDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PincodeDeliveryRepository extends JpaRepository<PincodeDelivery, Long> {
    Optional<PincodeDelivery> findByPincode(String pincode);

}