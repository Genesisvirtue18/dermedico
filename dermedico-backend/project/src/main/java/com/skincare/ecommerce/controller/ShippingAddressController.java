package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.AddressRequestDTO;
import com.skincare.ecommerce.dto.AddressResponseDTO;
import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.entity.ShippingAddress;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.ShippingAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class ShippingAddressController {

    @Autowired
    private ShippingAddressService shippingAddressService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

  /*@GetMapping
    public ResponseEntity<List<ShippingAddress>> getAddresses(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(shippingAddressService.getUserAddresses(user));
    }*/

    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getAddresses(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(shippingAddressService.getUserAddresses(user));
    }


//    @PostMapping
//    public ResponseEntity<?> addAddress(
//            @RequestBody ShippingAddress address,
//            Authentication authentication) {
//        try {
//            User user = getCurrentUser(authentication);
//            ShippingAddress savedAddress = shippingAddressService.addAddress(user, address);
//            return ResponseEntity.ok(savedAddress);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
//        }
//    }

    @PostMapping
    public ResponseEntity<?> addAddress(
            @RequestBody AddressRequestDTO request,
            Authentication authentication) {

        try {
            User user = getCurrentUser(authentication);

            ShippingAddress savedAddress =
                    shippingAddressService.addAddress(user, request);

            return ResponseEntity.ok(savedAddress);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<?> updateAddress(
            @PathVariable Long addressId,
            @RequestBody AddressRequestDTO request,
            Authentication authentication) {

        try {
            User user = getCurrentUser(authentication);

            ShippingAddress updatedAddress =
                    shippingAddressService.updateAddress(user, addressId, request);

            return ResponseEntity.ok(updatedAddress);

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> deleteAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            shippingAddressService.deleteAddress(user, addressId);
            return ResponseEntity.ok(new ApiResponse(true, "Address deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
