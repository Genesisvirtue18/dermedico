package com.skincare.ecommerce.service;

import com.skincare.ecommerce.Mapper.OrderMapper;
import com.skincare.ecommerce.dto.*;
import com.skincare.ecommerce.entity.*;
import com.skincare.ecommerce.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ShippingAddressRepository shippingAddressRepository;

    @Autowired
    private PincodeDeliveryRepository pincodeDeliveryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EmailService emailService;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.18");

    @Transactional
    public Order createOrder(User user, Long shippingAddressId, Order.PaymentMethod paymentMethod) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        ShippingAddress shippingAddress = shippingAddressRepository.findById(shippingAddressId)
                .orElseThrow(() -> new RuntimeException("Shipping address not found"));

        if (!shippingAddress.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Invalid shipping address");
        }

//        PincodeDelivery pincodeDelivery = pincodeDeliveryRepository.findByPincode(shippingAddress.getPincode())
//                .orElseThrow(() -> new RuntimeException("Delivery not available for this pincode"));

        PincodeDelivery pincodeDelivery = shippingAddress.getPincodeDelivery();

        if (pincodeDelivery == null) {
            throw new RuntimeException("Pincode not linked to address");
        }

        if (!pincodeDelivery.isDeliveryAvailable()) {
            throw new RuntimeException("Delivery not available for this pincode");
        }

        if (paymentMethod == Order.PaymentMethod.COD && !pincodeDelivery.isCodAvailable()) {
            throw new RuntimeException("COD not available for this pincode");
        }

        for (CartItem item : cartItems) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + item.getProduct().getName());
            }
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        Set<OrderItem> orderItems = new HashSet<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal itemSubtotal = product.getPrice().multiply(new BigDecimal(cartItem.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setSubtotal(itemSubtotal);
            orderItems.add(orderItem);

            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        BigDecimal tax = subtotal.multiply(TAX_RATE);
        BigDecimal shippingCharges = pincodeDelivery.getShippingCharges();
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(tax).add(shippingCharges).subtract(discount);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setShippingCharges(shippingCharges);
        order.setDiscount(discount);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(paymentMethod);
        order.setStatus(Order.OrderStatus.PENDING);

        if (paymentMethod == Order.PaymentMethod.COD) {
            order.setStatus(Order.OrderStatus.CONFIRMED);

            // Send email immediately for COD
            emailService.sendOrderConfirmationEmail(
                    user.getEmail(),
                    order.getOrderNumber()
            );
            cartItemRepository.deleteByUser(user);


        } else {
            order.setStatus(Order.OrderStatus.PENDING);
        }

        order = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);
        order = orderRepository.save(order);

        //cartItemRepository.deleteByUser(user);

        return order;
    }




    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUser(user);
    }

   /* public Page<Order> getUserOrders(User user, Pageable pageable) {
        return orderRepository.findByUser(user, pageable);
    }*/

    public Page<OrderDTO> getUserOrders(User user, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUser(user, pageable);

        return orders.map(order -> {
            AddressResponseDTO addressDTO = new AddressResponseDTO();
            addressDTO.setId(order.getShippingAddress().getId());
            addressDTO.setRecipientName(order.getShippingAddress().getRecipientName());
            addressDTO.setPhone(order.getShippingAddress().getPhone());
            addressDTO.setStreet(order.getShippingAddress().getStreet());
            ShippingAddress shipping = order.getShippingAddress();
            PincodeDelivery pin = shipping.getPincodeDelivery();

            addressDTO.setCity(pin.getCity());
            addressDTO.setState(pin.getState());
            addressDTO.setPincode(pin.getPincode());
            addressDTO.setDefault(order.getShippingAddress().isDefault()); // ✅ set isDefault

            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemDTO dto = new OrderItemDTO();
                dto.setId(item.getId());
                dto.setProductId(item.getProduct().getId());
                dto.setProductName(item.getProduct().getName());
                dto.setProductImage(item.getProduct().getMainImage()); // ✅ Add this line
                dto.setQuantity(item.getQuantity());
                dto.setPrice(item.getPrice());
                dto.setSubtotal(item.getSubtotal());
                return dto;
            }).collect(Collectors.toList());

            return new OrderDTO(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getSubtotal(),
                    order.getTax(),
                    order.getTotalAmount(),
                    order.getStatus().name(),
                    order.getPaymentMethod().name(),
                    order.getShippingCharges(),
                    order.getCreatedAt(),
                    addressDTO,
                    order.getTrackingNumber(),
                    itemDTOs
            );
        });
    }


    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);

        if (status == Order.OrderStatus.CONFIRMED) {
            emailService.sendOrderConfirmationEmail(order.getUser().getEmail(), order.getOrderNumber());
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order updateTrackingNumber(Long orderId, String trackingNumber) {
        Order order = getOrderById(orderId);
        order.setTrackingNumber(trackingNumber);
        return orderRepository.save(order);
    }

    /*public Page<Order> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }*/

    public Page<OrderResponseDTO> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable)
                .map(OrderMapper::toOrderDTO);
    }

    public OrderResponseDTO getOrderByTrackingNumberDTO(String trackingNumber) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with tracking number: " + trackingNumber));

        // Map Shipping Address
        ShippingAddressDTO shippingAddressDTO = null;
        if (order.getShippingAddress() != null) {
            shippingAddressDTO = new ShippingAddressDTO();
            shippingAddressDTO.setId(order.getShippingAddress().getId());
            shippingAddressDTO.setRecipientName(order.getShippingAddress().getRecipientName());
            shippingAddressDTO.setPhone(order.getShippingAddress().getPhone());
            shippingAddressDTO.setStreet(order.getShippingAddress().getStreet());
            ShippingAddress shipping = order.getShippingAddress();
            PincodeDelivery pin = shipping.getPincodeDelivery();

            shippingAddressDTO.setCity(pin.getCity());
            shippingAddressDTO.setState(pin.getState());
            shippingAddressDTO.setPincode(pin.getPincode());
        }

        // Map Order Items
        List<OrderItemDTO> items = order.getItems().stream().map(item -> {
            OrderItemDTO dto = new OrderItemDTO();
            dto.setId(item.getId());
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            dto.setQuantity(item.getQuantity());
            dto.setPrice(item.getPrice());
            dto.setSubtotal(item.getSubtotal());
            return dto;
        }).toList();

        // Map Order to OrderResponseDTO
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setShippingCharges(order.getShippingCharges());
        dto.setDiscount(order.getDiscount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod().name());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setShippingAddress(shippingAddressDTO);
        dto.setItems(items);

        return dto;
    }

    }
