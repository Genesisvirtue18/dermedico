package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.dto.CartItemDTO;
import com.skincare.ecommerce.dto.MergeCartItemDTO;
import com.skincare.ecommerce.dto.ProductDTO;
import com.skincare.ecommerce.entity.CartItem;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /*@GetMapping
    public ResponseEntity<List<CartItem>> getCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(cartService.getCartItems(user));
    }*/

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(cartService.getCartItems(user));
    }


    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            CartItem item = cartService.addToCart(user, productId, quantity);
            return ResponseEntity.ok(new ApiResponse(true, "Product added to cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

  /*  @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam int quantity,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            CartItem item = cartService.updateCartItem(user, cartItemId, quantity);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }*/

    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam int quantity,
            Authentication authentication) {

        try {
            User user = getCurrentUser(authentication);
            CartItem item = cartService.updateCartItem(user, cartItemId, quantity);

            CartItemDTO dto = new CartItemDTO(
                    item.getId(),
                    item.getQuantity(),
                    ProductDTO.builder()
                            .id(item.getProduct().getId())
                            .name(item.getProduct().getName())
                            .price(item.getProduct().getPrice())
                            .mainImage(item.getProduct().getMainImage())
                            .stockQuantity(item.getProduct().getStockQuantity())
                            .build()
            );

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }


    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            cartService.removeFromCart(user, cartItemId);
            return ResponseEntity.ok(new ApiResponse(true, "Item removed from cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        cartService.clearCart(user);
        return ResponseEntity.ok(new ApiResponse(true, "Cart cleared"));
    }


    //MERGE CART WHEN LOGIN
    @PostMapping("/merge")
    public ResponseEntity<?> mergeCart(
            @RequestBody List<MergeCartItemDTO> items,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        cartService.mergeGuestCart(user, items);
        return ResponseEntity.ok().build();
    }


}
