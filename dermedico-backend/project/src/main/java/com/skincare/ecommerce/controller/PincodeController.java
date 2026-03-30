package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.PincodeCheckResponse;
import com.skincare.ecommerce.entity.PincodeDelivery;
import com.skincare.ecommerce.service.ExternalPincodeService;
import com.skincare.ecommerce.service.PincodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pincode")
public class PincodeController {

    @Autowired
    private ExternalPincodeService externalPincodeService;

    @Autowired
    private PincodeService pincodeService;

    @GetMapping("/check/{pincode}")
    public ResponseEntity<PincodeCheckResponse> checkPincode(@PathVariable String pincode) {
        return ResponseEntity.ok(pincodeService.checkPincode(pincode));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PincodeDelivery>> getAllPincodes() {
        return ResponseEntity.ok(pincodeService.getAllPincodes());
    }



}
