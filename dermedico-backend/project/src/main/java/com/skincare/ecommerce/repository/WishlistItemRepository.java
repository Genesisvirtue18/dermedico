package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUser(User user);
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
    boolean existsByUserAndProduct(User user, Product product);
}
