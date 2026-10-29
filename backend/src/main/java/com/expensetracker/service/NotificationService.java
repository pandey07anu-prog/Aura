package com.expensetracker.service;

import com.expensetracker.model.Notification;
import com.expensetracker.model.NotificationType;
import com.expensetracker.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(String userId, String title, String message, NotificationType type) {
        Notification notification = new Notification(userId, title, message, type);
        return notificationRepository.save(notification);
    }

    public List<Notification> getRecentNotifications(String userId) {
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(String id, String userId) {
        notificationRepository.findById(id).ifPresent(notification -> {
            if (userId.equals(notification.getUserId())) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }

    public void clearAll(String userId) {
        notificationRepository.deleteAllByUserId(userId);
    }
}
