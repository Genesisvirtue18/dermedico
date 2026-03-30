package com.skincare.ecommerce.service;

import com.skincare.ecommerce.dto.CartItemDTO;
import com.skincare.ecommerce.dto.MergeCartItemDTO;
import com.skincare.ecommerce.dto.ProductDTO;
import com.skincare.ecommerce.entity.CartItem;
import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.CartItemRepository;
import com.skincare.ecommerce.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

   /* public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUser(user);
    }*/

    public List<CartItemDTO> getCartItems(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        return cartItems.stream()
                .map(item -> new CartItemDTO(
                        item.getId(),
                        item.getQuantity(),
                        ProductDTO.builder()
                                .id(item.getProduct().getId())
                                .name(item.getProduct().getName())
                                .price(item.getProduct().getPrice())
                                .mainImage(item.getProduct().getMainImage())
                                .stockQuantity(item.getProduct().getStockQuantity())
                                .build()
                ))
                .toList();
    }



    @Transactional
    public CartItem addToCart(User user, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserAndProduct(user, product);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            return cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            return cartItemRepository.save(newItem);
        }
    }

    @Transactional
    public CartItem updateCartItem(User user, Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        if (item.getProduct().getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeFromCart(User user, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }


    @Transactional
    public void mergeGuestCart(User user, List<MergeCartItemDTO> items) {

        if (items == null || items.isEmpty()) return;

        for (MergeCartItemDTO dto : items) {

            if (dto.getQuantity() == null || dto.getQuantity() <= 0) continue;

            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            CartItem cartItem = cartItemRepository
                    .findByUserAndProduct(user, product)
                    .orElse(null);

            if (cartItem != null) {
                // ✅ UPDATE quantity (guest quantity added)
                cartItem.setQuantity(
                        cartItem.getQuantity() + dto.getQuantity()
                );
            } else {
                // ✅ INSERT new product
                CartItem newItem = new CartItem();
                newItem.setUser(user);
                newItem.setProduct(product);
                newItem.setQuantity(dto.getQuantity());

                cartItemRepository.save(newItem);
            }
        }
    }

}

