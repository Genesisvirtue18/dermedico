package com.skincare.ecommerce.service;

import com.skincare.ecommerce.dto.AddressRequestDTO;
import com.skincare.ecommerce.dto.AddressResponseDTO;
import com.skincare.ecommerce.entity.PincodeDelivery;
import com.skincare.ecommerce.entity.ShippingAddress;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.PincodeDeliveryRepository;
import com.skincare.ecommerce.repository.ShippingAddressRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class ShippingAddressService {

    @Autowired
    private ExternalPincodeService externalPincodeService;

    @Autowired
    private ShippingAddressRepository shippingAddressRepository;

    @Autowired
    private PincodeDeliveryRepository pincodeDeliveryRepository;

    public List<AddressResponseDTO> getUserAddresses(User user) {

        List<ShippingAddress> addresses =
                shippingAddressRepository.findByUser(user);

        return addresses.stream()
                .map(addr -> {

                    PincodeDelivery pin = addr.getPincodeDelivery();

                    AddressResponseDTO dto = new AddressResponseDTO();
                    dto.setId(addr.getId());
                    dto.setStreet(addr.getStreet());
                    dto.setCity(pin.getCity());
                    dto.setState(pin.getState());
                    dto.setPincode(pin.getPincode());
                    dto.setPhone(addr.getPhone());
                    dto.setRecipientName(addr.getRecipientName());
                    dto.setLandmark(addr.getLandmark());
                    dto.setDefault(addr.isDefault());

                    return dto;
                })
                .toList();
    }


//   public List<AddressResponseDTO> getUserAddresses(User user) {
//       List<ShippingAddress> addresses = shippingAddressRepository.findByUser(user);
//
//       return addresses.stream()
//               .map(addr -> {
//                   AddressResponseDTO dto = new AddressResponseDTO();
//                   dto.setId(addr.getId());
//                   dto.setStreet(addr.getStreet());
//                   dto.setCity(addr.getCity());
//                   dto.setState(addr.getState());
//                   dto.setPincode(addr.getPincode());
//                   dto.setPhone(addr.getPhone());
//                   dto.setRecipientName(addr.getRecipientName());
//                   dto.setLandmark(addr.getLandmark()); // ✅ add this line
//                   dto.setDefault(addr.isDefault());
//                   return dto;
//               })
//               .toList();
//   }

//    @Transactional
//    public ShippingAddress addAddress(User user, ShippingAddress address) {
//        address.setUser(user);
//
//        if (address.isDefault()) {
//            shippingAddressRepository.findByUser(user).forEach(addr -> {
//                addr.setDefault(false);
//                shippingAddressRepository.save(addr);
//            });
//        }
//
//        return shippingAddressRepository.save(address);
//    }



    @Transactional
    public ShippingAddress addAddress(User user, AddressRequestDTO request) {

        // 1️⃣ Check if pincode already exists
        PincodeDelivery pincodeDelivery = pincodeDeliveryRepository
                .findByPincode(request.getPincode())
                .orElseGet(() -> {

                    // 2️⃣ Create new pincode entry manually
                    PincodeDelivery newPin = new PincodeDelivery();
                    newPin.setPincode(request.getPincode());
                    newPin.setCity(request.getCity());
                    newPin.setState(request.getState());

                    // Fixed values
                    newPin.setDeliveryAvailable(true);
                    newPin.setCodAvailable(true);
                    newPin.setShippingCharges(BigDecimal.valueOf(100));
                    newPin.setEstimatedDays(3);

                    return pincodeDeliveryRepository.save(newPin);
                });

        // 3️⃣ Create Shipping Address
        ShippingAddress address = new ShippingAddress();
        address.setUser(user);
        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setLandmark(request.getLandmark());
        address.setDefault(request.isDefault());
        address.setPincodeDelivery(pincodeDelivery);

        // 4️⃣ Handle default logic
        if (request.isDefault()) {
            shippingAddressRepository.findByUser(user).forEach(addr -> {
                addr.setDefault(false);
                shippingAddressRepository.save(addr);
            });
        }

        return shippingAddressRepository.save(address);
    }


//    @Transactional
//    public ShippingAddress updateAddress(User user, Long addressId, ShippingAddress updatedAddress) {
//        ShippingAddress address = shippingAddressRepository.findById(addressId)
//                .orElseThrow(() -> new RuntimeException("Address not found"));
//
//        if (!address.getUser().getId().equals(user.getId())) {
//            throw new RuntimeException("Unauthorized access");
//        }
//
//        address.setRecipientName(updatedAddress.getRecipientName());
//        address.setPhone(updatedAddress.getPhone());
//        address.setStreet(updatedAddress.getStreet());
//        address.setCity(updatedAddress.getCity());
//        address.setState(updatedAddress.getState());
//        address.setPincode(updatedAddress.getPincode());
//        address.setLandmark(updatedAddress.getLandmark());
//
//        if (updatedAddress.isDefault() && !address.isDefault()) {
//            shippingAddressRepository.findByUser(user).forEach(addr -> {
//                addr.setDefault(false);
//                shippingAddressRepository.save(addr);
//            });
//            address.setDefault(true);
//        }
//
//        return shippingAddressRepository.save(address);
//    }



    @Transactional
    public ShippingAddress updateAddress(
            User user,
            Long addressId,
            AddressRequestDTO request) {

        ShippingAddress address = shippingAddressRepository
                .findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        // 1️⃣ Find or create pincode
        PincodeDelivery pincodeDelivery = pincodeDeliveryRepository
                .findByPincode(request.getPincode())
                .orElseGet(() -> {

                    PincodeDelivery newPin = new PincodeDelivery();
                    newPin.setPincode(request.getPincode());
                    newPin.setCity(request.getCity());
                    newPin.setState(request.getState());
                    newPin.setDeliveryAvailable(true);
                    newPin.setCodAvailable(true);
                    newPin.setShippingCharges(BigDecimal.valueOf(100));
                    newPin.setEstimatedDays(3);

                    return pincodeDeliveryRepository.save(newPin);
                });

        // 2️⃣ Update basic fields
        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setStreet(request.getStreet());
        address.setLandmark(request.getLandmark());
        address.setPincodeDelivery(pincodeDelivery);

        // 3️⃣ Default logic
        if (request.isDefault() && !address.isDefault()) {
            shippingAddressRepository.findByUser(user).forEach(addr -> {
                addr.setDefault(false);
                shippingAddressRepository.save(addr);
            });
            address.setDefault(true);
        }

        return shippingAddressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        ShippingAddress address = shippingAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        shippingAddressRepository.delete(address);
    }
}
