package com.skincare.ecommerce.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExternalPincodeService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> verifyPincode(String pincode) {

        Map<String, Object> result = new HashMap<>();

        try {

            String url = "https://api.postalpincode.in/pincode/" + pincode;

            List<Map> response = restTemplate.getForObject(url, List.class);

            if (response == null || response.isEmpty()) {
                result.put("valid", false);
                return result;
            }

            Map firstResponse = response.get(0);

            if (!"Success".equalsIgnoreCase(
                    String.valueOf(firstResponse.get("Status")))) {

                result.put("valid", false);
                return result;
            }

            List<Map> postOffices =
                    (List<Map>) firstResponse.get("PostOffice");

            if (postOffices == null || postOffices.isEmpty()) {
                result.put("valid", false);
                return result;
            }

            Map postOffice = postOffices.get(0);

            result.put("valid", true);
            result.put("city", postOffice.get("District"));
            result.put("state", postOffice.get("State"));

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            result.put("valid", false);
            return result;
        }
    }}