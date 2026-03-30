package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.entity.WishlistItem;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(wishlistService.getWishlistItems(user));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(
            @RequestParam Long productId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            WishlistItem item = wishlistService.addToWishlist(user, productId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{wishlistItemId}")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Long wishlistItemId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            wishlistService.removeFromWishlist(user, wishlistItemId);
            return ResponseEntity.ok(new ApiResponse(true, "Item removed from wishlist"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/{wishlistItemId}/move-to-cart")
    public ResponseEntity<?> moveToCart(
            @PathVariable Long wishlistItemId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            wishlistService.moveToCart(user, wishlistItemId);
            return ResponseEntity.ok(new ApiResponse(true, "Item moved to cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
