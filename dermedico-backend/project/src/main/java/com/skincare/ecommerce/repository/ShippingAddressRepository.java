package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.ShippingAddress;
import com.skincare.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByUser(User user);
    Optional<ShippingAddress> findByUserAndIsDefaultTrue(User user);
}
