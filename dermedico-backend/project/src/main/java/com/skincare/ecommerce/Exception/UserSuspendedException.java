package com.skincare.ecommerce.Exception;

public class UserSuspendedException extends RuntimeException {
    public UserSuspendedException(String message) {
        super(message);
    }
}
