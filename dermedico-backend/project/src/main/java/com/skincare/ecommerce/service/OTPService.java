package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.OTP;
import com.skincare.ecommerce.repository.OTPRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OTPService {

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Value("${otp.expiration}") // milliseconds
    private Long otpExpiration;

    @Value("${otp.max-attempts}")
    private int maxAttempts;

    private static final SecureRandom random = new SecureRandom();

    private String generateOTP() {
        return String.valueOf(100000 + random.nextInt(900000));
    }

    /**
     * Create new OTP (invalidate old one)
     */
    @Transactional
    public void createAndSendOTP(String email) {
        // Invalidate any existing OTP
        otpRepository.deleteByEmail(email);

        String code = generateOTP();

        OTP otp = new OTP();
        otp.setEmail(email);
        otp.setCode(code);
        otp.setAttempts(0);
        otp.setVerified(false);

        // ✅ CORRECT EXPIRY: milliseconds → seconds
        otp.setExpiresAt(
                LocalDateTime.now().plusSeconds(otpExpiration / 1000)
        );

        otpRepository.save(otp);

        emailService.sendOTPEmail(email, code);
    }

    /**
     * Verify OTP
     */
    @Transactional
    public boolean verifyOTP(String email, String code) {
        Optional<OTP> otpOpt = otpRepository.findByEmailAndVerifiedFalse(email);

        if (otpOpt.isEmpty()) {
            return false;
        }

        OTP otp = otpOpt.get();

        // ❌ Expired
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otp);
            return false;
        }

        // ❌ Max attempts reached
        if (otp.getAttempts() >= maxAttempts) {
            otpRepository.delete(otp);
            return false;
        }

        // Count this attempt
        otp.setAttempts(otp.getAttempts() + 1);

        // ✅ Correct OTP
        if (otp.getCode().equals(code)) {
            otp.setVerified(true);
            otpRepository.save(otp);
            return true;
        }

        otpRepository.save(otp);
        return false;
    }

    /**
     * Force invalidate OTP (optional)
     */
    @Transactional
    public void invalidateOTP(String email) {
        otpRepository.deleteByEmail(email);
    }
}
