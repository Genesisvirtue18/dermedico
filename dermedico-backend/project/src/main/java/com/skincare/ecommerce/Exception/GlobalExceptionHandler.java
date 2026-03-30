package com.skincare.ecommerce.Exception;

import com.skincare.ecommerce.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiResponse(false, ex.getMessage()));
    }

    @ExceptionHandler(UserSuspendedException.class)
    public ResponseEntity<ApiResponse> handleUserSuspended(UserSuspendedException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiResponse(false, ex.getMessage()));
    }
}
