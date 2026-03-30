package com.skincare.ecommerce.service;

import com.skincare.ecommerce.Mapper.OrderMapper;
import com.skincare.ecommerce.dto.OrderItemDTO;
import com.skincare.ecommerce.dto.OrderResponseDTO;
import com.skincare.ecommerce.dto.ShippingAddressDTO;
import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.entity.PincodeDelivery;
import com.skincare.ecommerce.entity.ShippingAddress;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.OrderRepository;
import com.skincare.ecommerce.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(false);
        return userRepository.save(user);
    }

    @Transactional
    public User unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        return userRepository.save(user);
    }

   /* public List<Order> getUserPurchaseHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUser(user);
    }*/

    public List<OrderResponseDTO> getUserPurchaseHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders = orderRepository.findByUser(user);

        // Map to DTOs
        return orders.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

//    private OrderResponseDTO mapToDTO(Order order) {
//        OrderResponseDTO dto = new OrderResponseDTO();
//        dto.setId(order.getId());
//        dto.setOrderNumber(order.getOrderNumber());
//        dto.setSubtotal(order.getSubtotal());
//        dto.setTax(order.getTax());
//        dto.setShippingCharges(order.getShippingCharges());
//        dto.setDiscount(order.getDiscount());
//        dto.setTotalAmount(order.getTotalAmount());
//        dto.setStatus(order.getStatus().name());
//        dto.setPaymentMethod(order.getPaymentMethod().name());
//        dto.setTrackingNumber(order.getTrackingNumber());
//        dto.setCreatedAt(order.getCreatedAt());
//        dto.setUpdatedAt(order.getUpdatedAt());
//
//        // Only include shipping address
//        if (order.getShippingAddress() != null) {
//            ShippingAddressDTO addrDTO = new ShippingAddressDTO();
//            addrDTO.setId(order.getShippingAddress().getId());
//            addrDTO.setRecipientName(order.getShippingAddress().getRecipientName());
//            addrDTO.setPhone(order.getShippingAddress().getPhone());
//            addrDTO.setStreet(order.getShippingAddress().getStreet());
//            addrDTO.setCity(order.getShippingAddress().getCity());
//            addrDTO.setState(order.getShippingAddress().getState());
//            addrDTO.setPincode(order.getShippingAddress().getPincode());
//            addrDTO.setLandmark(order.getShippingAddress().getLandmark());
//            dto.setShippingAddress(addrDTO);
//        }
//
//        // Map order items
//        List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
//            OrderItemDTO itemDTO = new OrderItemDTO();
//            itemDTO.setId(item.getId());
//            itemDTO.setProductName(item.getProduct().getName());
//            itemDTO.setQuantity(item.getQuantity());
//            itemDTO.setPrice(item.getPrice());
//            itemDTO.setSubtotal(item.getSubtotal());
//            return itemDTO;
//        }).collect(Collectors.toList());
//
//        dto.setItems(itemDTOs);
//
//        return dto;
//    }


   /* public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }*/

    private OrderResponseDTO mapToDTO(Order order) {

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

        // ✅ FIXED SHIPPING ADDRESS MAPPING
        if (order.getShippingAddress() != null) {

            ShippingAddress shipping = order.getShippingAddress();
            PincodeDelivery pin = shipping.getPincodeDelivery();

            ShippingAddressDTO addrDTO = new ShippingAddressDTO();
            addrDTO.setId(shipping.getId());
            addrDTO.setRecipientName(shipping.getRecipientName());
            addrDTO.setPhone(shipping.getPhone());
            addrDTO.setStreet(shipping.getStreet());
            addrDTO.setLandmark(shipping.getLandmark());

            if (pin != null) {
                addrDTO.setCity(pin.getCity());
                addrDTO.setState(pin.getState());
                addrDTO.setPincode(pin.getPincode());
            }

            dto.setShippingAddress(addrDTO);
        }

        // Map order items
        List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setSubtotal(item.getSubtotal());
            return itemDTO;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);

        return dto;
    }

    public Page<OrderResponseDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(OrderMapper::toOrderDTO);
    }
}
