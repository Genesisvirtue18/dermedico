package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.entity.WishlistItem;
import com.skincare.ecommerce.repository.ProductRepository;
import com.skincare.ecommerce.repository.WishlistItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    public List<WishlistItem> getWishlistItems(User user) {
        return wishlistItemRepository.findByUser(user);
    }

    @Transactional
    public WishlistItem addToWishlist(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (wishlistItemRepository.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("Product already in wishlist");
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        return wishlistItemRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(User user, Long wishlistItemId) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        wishlistItemRepository.delete(item);
    }

    @Transactional
    public void moveToCart(User user, Long wishlistItemId) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        cartService.addToCart(user, item.getProduct().getId(), 1);
        wishlistItemRepository.delete(item);
    }
}
