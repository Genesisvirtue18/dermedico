package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Order;
import com.skincare.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUser(User user);
    Page<Order> findByUser(User user, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") Order.OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalRevenue(@Param("status") Order.OrderStatus status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    Optional<Order> findByTrackingNumber(String trackingNumber);
}
