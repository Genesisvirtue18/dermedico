package com.skincare.ecommerce.Mapper;

import com.skincare.ecommerce.dto.*;
import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.entity.OrderItem;
import com.skincare.ecommerce.entity.PincodeDelivery;
import com.skincare.ecommerce.entity.ShippingAddress;

import java.util.stream.Collectors;

public class OrderMapper {

//    public static OrderResponseDTO toOrderDTO(Order order) {
//        OrderResponseDTO dto = new OrderResponseDTO();
//
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
//        // user
//        UserDTO userDTO = new UserDTO();
//        userDTO.setId(order.getUser().getId());
//        userDTO.setName(order.getUser().getName());
//        userDTO.setEmail(order.getUser().getEmail());
//        userDTO.setPhone(order.getUser().getPhone());
//        dto.setUser(userDTO);
//
//        // shipping address
//        var address = order.getShippingAddress();
//        ShippingAddressDTO addressDTO = new ShippingAddressDTO();
//        addressDTO.setId(address.getId());
//        addressDTO.setRecipientName(address.getRecipientName());
//        addressDTO.setPhone(address.getPhone());
//        addressDTO.setStreet(address.getStreet());
//        addressDTO.setCity(address.getCity());
//        addressDTO.setState(address.getState());
//        addressDTO.setPincode(address.getPincode());
//        addressDTO.setLandmark(address.getLandmark());
//        dto.setShippingAddress(addressDTO);
//
//        // items
//        dto.setItems(order.getItems().stream().map(item -> {
//            OrderItemDTO itemDTO = new OrderItemDTO();
//            itemDTO.setId(item.getId());
//            itemDTO.setProductId(item.getProduct().getId());
//            itemDTO.setProductName(item.getProduct().getName());
//            itemDTO.setQuantity(item.getQuantity());
//            itemDTO.setPrice(item.getPrice());
//            itemDTO.setSubtotal(item.getSubtotal());
//            return itemDTO;
//        }).collect(Collectors.toList()));
//
//        return dto;
//    }

    public static OrderResponseDTO toOrderDTO(Order order) {

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

        // ✅ USER
        UserDTO userDTO = new UserDTO();
        userDTO.setId(order.getUser().getId());
        userDTO.setName(order.getUser().getName());
        userDTO.setEmail(order.getUser().getEmail());
        userDTO.setPhone(order.getUser().getPhone());
        dto.setUser(userDTO);

        // ✅ SHIPPING ADDRESS (FIXED)
        ShippingAddress address = order.getShippingAddress();

        if (address != null) {

            ShippingAddressDTO addressDTO = new ShippingAddressDTO();
            addressDTO.setId(address.getId());
            addressDTO.setRecipientName(address.getRecipientName());
            addressDTO.setPhone(address.getPhone());
            addressDTO.setStreet(address.getStreet());
            addressDTO.setLandmark(address.getLandmark());

            PincodeDelivery pin = address.getPincodeDelivery();
            if (pin != null) {
                addressDTO.setCity(pin.getCity());
                addressDTO.setState(pin.getState());
                addressDTO.setPincode(pin.getPincode());
            }

            dto.setShippingAddress(addressDTO);
        }

        // ✅ ITEMS
        dto.setItems(order.getItems().stream().map(item -> {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setSubtotal(item.getSubtotal());
            return itemDTO;
        }).collect(Collectors.toList()));

        return dto;
    }
}
