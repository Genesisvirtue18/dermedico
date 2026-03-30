package com.skincare.ecommerce.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.entity.Payment;
import com.skincare.ecommerce.repository.CartItemRepository;
import com.skincare.ecommerce.repository.OrderRepository;
import com.skincare.ecommerce.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    @Transactional
    public String createRazorpayOrder(Order order) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", order.getTotalAmount().multiply(new BigDecimal(100)).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", order.getOrderNumber());

        com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setReceiptNumber(order.getOrderNumber());
        paymentRepository.save(payment);

        return razorpayOrder.get("id");
    }

    @Transactional
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature)
            throws RazorpayException {

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", razorpayOrderId);
        options.put("razorpay_payment_id", razorpayPaymentId);
        options.put("razorpay_signature", razorpaySignature);

        boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

        if (isValid) {
            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            orderService.updateOrderStatus(payment.getOrder().getId(), Order.OrderStatus.CONFIRMED);
            cartItemRepository.deleteByUser(payment.getOrder().getUser());

        }

        return isValid;
    }

    @Transactional
    public void processRefund(Long orderId) throws RazorpayException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Payment payment = order.getPayment();
        if (payment == null || payment.getRazorpayPaymentId() == null) {
            throw new RuntimeException("No payment found for refund");
        }

        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject refundRequest = new JSONObject();
        refundRequest.put("amount", payment.getAmount().multiply(new BigDecimal(100)).intValue());

        // Fetch the payment (optional, if you need to validate)
        com.razorpay.Payment razorpayPayment = razorpay.payments.fetch(payment.getRazorpayPaymentId());

// Create refund via Refund API
        razorpay.refunds.create(refundRequest);


        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        order.setStatus(Order.OrderStatus.REFUNDED);
        orderRepository.save(order);
    }
}
