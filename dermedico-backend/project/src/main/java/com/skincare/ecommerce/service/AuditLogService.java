package com.skincare.ecommerce.service;

import com.skincare.ecommerce.entity.AuditLog;
import com.skincare.ecommerce.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Async
    public void log(Long userId, String userEmail, String action, String entity, Long entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setUserEmail(userEmail);
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }
}
