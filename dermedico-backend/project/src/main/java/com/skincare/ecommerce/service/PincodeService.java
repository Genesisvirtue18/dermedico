package com.skincare.ecommerce.service;

import com.skincare.ecommerce.dto.PincodeCheckResponse;
import com.skincare.ecommerce.entity.PincodeDelivery;
import com.skincare.ecommerce.repository.PincodeDeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PincodeService {

    @Autowired
    private ExternalPincodeService externalPincodeService;

    @Autowired
    private PincodeDeliveryRepository pincodeDeliveryRepository;

    public List<PincodeDelivery> getAllPincodeRules() {
        return pincodeDeliveryRepository.findAll();
    }



//    public PincodeCheckResponse checkPincode(String pincode) {
//
//        Optional<PincodeDelivery> deliveryOpt = pincodeDeliveryRepository.findByPincode(pincode);
//
//        if (deliveryOpt.isEmpty()) {
//            return new PincodeCheckResponse(
//                    false,
//                    false,
//                    null,
//                    BigDecimal.ZERO,
//                    null,
//                    null,
//                    "Delivery not available for this pincode"
//            );
//        }
//
//        PincodeDelivery delivery = deliveryOpt.get();
//
//        if (!delivery.isDeliveryAvailable()) {
//            return new PincodeCheckResponse(
//                    false,
//                    false,
//                    null,
//                    BigDecimal.ZERO,
//                    delivery.getState(),
//                    delivery.getCity(),
//                    "Delivery not available for this pincode"
//            );
//        }
//
//        String message = String.format("Delivery available in %d days", delivery.getEstimatedDays());
//
//        return new PincodeCheckResponse(
//                delivery.isDeliveryAvailable(),
//                delivery.isCodAvailable(),
//                delivery.getEstimatedDays(),
//                delivery.getShippingCharges(),
//                delivery.getState(),
//                delivery.getCity(),
//                message
//        );
//    }


    public PincodeCheckResponse checkPincode(String pincode) {

        Map<String, Object> response =
                externalPincodeService.verifyPincode(pincode);

        Boolean valid = (Boolean) response.get("valid");

        if (valid == null || !valid) {
            return new PincodeCheckResponse(false, null, null);
        }

        String city = (String) response.get("city");
        String state = (String) response.get("state");

        return new PincodeCheckResponse(true, city, state);
    }

    public PincodeDelivery savePincodeRule(PincodeDelivery pincodeDelivery) {
        return pincodeDeliveryRepository.save(pincodeDelivery);
    }

    public void deletePincodeRule(Long id) {
        pincodeDeliveryRepository.deleteById(id);
    }

    public List<PincodeDelivery> getAllPincodes() {
        return pincodeDeliveryRepository.findAll();
    }

}
