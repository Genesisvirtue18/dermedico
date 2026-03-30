
package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.*;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.security.JwtUtil;
import com.skincare.ecommerce.service.AuditLogService;
import com.skincare.ecommerce.service.OTPService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OTPService otpService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Email already registered"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(User.Role.USER);
        user.setActive(true);

        userRepository.save(user);

        auditLogService.log(
                user.getId(),
                user.getEmail(),
                "REGISTER",
                "User",
                user.getId(),
                "User registered successfully",
                httpRequest.getRemoteAddr()
        );

        // ❌ DO NOT SEND OTP HERE
        return ResponseEntity.ok(
                new ApiResponse(true, "Registration successful. Please login to receive OTP.")
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "User not found. Please register first."));
        }

        User user = userOpt.get();

        if (!user.isActive()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Your account has been suspended."));
        }

        otpService.createAndSendOTP(request.getEmail());

        return ResponseEntity.ok(
                new ApiResponse(true, "OTP sent to your email.")
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@Valid @RequestBody VerifyOTPRequest request,
                                       HttpServletRequest httpRequest,
                                       HttpServletResponse response) {

        boolean isValid = otpService.verifyOTP(request.getEmail(), request.getOtp());
        if (!isValid) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid or expired OTP"));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Set HttpOnly Cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        // ✅ Include user info in the response
        Map<String, Object> data = new HashMap<>();
        data.put("email", user.getEmail());
        data.put("role", user.getRole().name());

        return ResponseEntity.ok(new ApiResponse(true, "Login successful", data));
    }



    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // Invalidate JWT cookie
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok("Logged out successfully");
    }

   /* @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(@CookieValue(name = "jwt", required = false) String token) {

        if (token == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        boolean valid = jwtUtil.validateToken(token);

        return ResponseEntity.ok(valid ? "Logged in" : "Invalid token");
    }*/

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(
            @CookieValue(name = "jwt", required = false) String token) {

        if (token == null) {
            return ResponseEntity.status(401).build();
        }

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok().build();
    }


}
