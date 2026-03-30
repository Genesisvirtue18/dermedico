package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUserEmail(String userEmail, Pageable pageable);
    Page<AuditLog> findByEntity(String entity, Pageable pageable);
}
