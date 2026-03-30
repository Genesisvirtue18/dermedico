package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.entity.PincodeDelivery;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.AuditLogService;
import com.skincare.ecommerce.service.PincodeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pincode")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPincodeController {

    @Autowired
    private PincodeService pincodeService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getAllPincodeRules() {
        try {
            List<PincodeDelivery> pincodes = pincodeService.getAllPincodeRules();
            return ResponseEntity.ok(pincodes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }


    @PostMapping
    public ResponseEntity<?> createPincodeRule(
            @RequestBody PincodeDelivery pincodeDelivery,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            PincodeDelivery saved = pincodeService.savePincodeRule(pincodeDelivery);

            auditLogService.log(admin.getId(), admin.getEmail(), "CREATE_PINCODE_RULE", "PincodeDelivery",
                    saved.getId(), "Created pincode rule for: " + saved.getPincode(), request.getRemoteAddr());

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePincodeRule(
            @PathVariable Long id,
            @RequestBody PincodeDelivery pincodeDelivery,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            pincodeDelivery.setId(id);
            PincodeDelivery updated = pincodeService.savePincodeRule(pincodeDelivery);

            auditLogService.log(admin.getId(), admin.getEmail(), "UPDATE_PINCODE_RULE", "PincodeDelivery",
                    id, "Updated pincode rule for: " + updated.getPincode(), request.getRemoteAddr());

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePincodeRule(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            pincodeService.deletePincodeRule(id);

            auditLogService.log(admin.getId(), admin.getEmail(), "DELETE_PINCODE_RULE", "PincodeDelivery",
                    id, "Deleted pincode rule", request.getRemoteAddr());

            return ResponseEntity.ok(new ApiResponse(true, "Pincode rule deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
