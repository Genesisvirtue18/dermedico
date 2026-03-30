package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.CartItem;
import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUser(User user);

    boolean existsByUserAndProduct(User user, Product product);
}
