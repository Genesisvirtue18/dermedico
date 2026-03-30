//package com.skincare.ecommerce.dto;
//
//import lombok.AllArgsConstructor;
//import lombok.Data;
//
//import java.math.BigDecimal;
//
//@Data
//@AllArgsConstructor
//public class PincodeCheckResponse {
//    private boolean deliveryAvailable;
//    private boolean codAvailable;
//    private Integer estimatedDays;
//    private BigDecimal shippingCharges;
//    private String message;
//    private String state;    // ✅ add state
//    private String city;
//}

package com.skincare.ecommerce.dto;

public class PincodeCheckResponse {

    private boolean valid;
    private String city;
    private String state;

    public PincodeCheckResponse() {}

    public PincodeCheckResponse(boolean valid, String city, String state) {
        this.valid = valid;
        this.city = city;
        this.state = state;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
