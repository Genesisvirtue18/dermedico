package com.skincare.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
//
//@Service
//public class EmailService {
//
//    @Autowired
//    private JavaMailSender mailSender;
//
//    @Async
//    public void sendOTPEmail(String to, String otp) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(to);
//        message.setSubject("Your OTP for Skincare E-Commerce");
//        message.setText("Your OTP is: " + otp + "\n\nThis OTP will expire in 5 minutes.\n\nDo not share this OTP with anyone.");
//
//        mailSender.send(message);
//    }
//
//    @Async
//    public void sendOrderConfirmationEmail(String to, String orderNumber) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(to);
//        message.setSubject("Order Confirmation - " + orderNumber);
//        message.setText("Your order " + orderNumber + " has been confirmed.\n\nThank you for shopping with us!");
//
//        mailSender.send(message);
//    }
//}
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final String FROM_EMAIL = "noreply@dermedicostore.in";

    @Async
    public void sendOTPEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(FROM_EMAIL);   // ✅ ADD THIS
        message.setTo(to);
        message.setSubject("Your OTP for Dermedico Store");
        message.setText(
                "Your OTP is: " + otp +
                        "\n\nThis OTP will expire in 5 minutes." +
                        "\n\nDo not share this OTP with anyone."
        );

        mailSender.send(message);
    }

    @Async
    public void sendOrderConfirmationEmail(String to, String orderNumber) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(FROM_EMAIL);   // ✅ ADD THIS
        message.setTo(to);
        message.setSubject("Order Confirmation - " + orderNumber);
        message.setText(
                "Your order " + orderNumber +
                        " has been confirmed.\n\nThank you for shopping with us!"
        );

        mailSender.send(message);
    }
}