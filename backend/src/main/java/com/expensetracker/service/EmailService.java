package com.expensetracker.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final ExecutorService emailExecutor = Executors.newCachedThreadPool();

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.mail.from:cleanai2026@gmail.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("[DEV EMAIL MODE] To: {} | Subject: {} | Content:\n{}", to, subject, body);
            return;
        }

        emailExecutor.submit(() -> {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
                helper.setFrom(fromEmail, "AURA Finance");
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(body, false);
                mailSender.send(mimeMessage);
                log.info("Email successfully dispatched to {}", to);
            } catch (Exception e) {
                log.warn("Could not dispatch email to {}: {}. Logged notification instead.", to, e.getMessage());
            }
        });
    }

    public void sendRegistrationOtpEmail(String to, String userName, String otpCode) {
        if (!mailEnabled) {
            log.info("[DEV EMAIL MODE] To: {} | Subject: AURA Verification Code | OTP: {}", to, otpCode);
            return;
        }

        emailExecutor.submit(() -> {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(fromEmail, "AURA Finance");
                helper.setTo(to);
                helper.setSubject("Your AURA verification code is " + otpCode);

                String html = "<!DOCTYPE html>" +
                        "<html><head><meta charset='utf-8'></head>" +
                        "<body style='margin:0;padding:40px 10px;background-color:#0a0a0c;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#e4e4e7;'>" +
                        "<div style='max-width:540px;margin:0 auto;background-color:#121214;border:1px solid #27272a;border-radius:16px;padding:36px;box-shadow:0 20px 40px rgba(0,0,0,0.6);'>" +
                        "<div style='margin-bottom:28px;'>" +
                        "<span style='font-size:18px;font-weight:bold;letter-spacing:2px;color:#ffffff;'>&#8377; AURA FINANCE</span>" +
                        "</div>" +
                        "<h1 style='color:#ffffff;font-size:22px;font-weight:700;margin:0 0 12px 0;'>Verify Your Email Address</h1>" +
                        "<p style='color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px 0;'>Hello " + userName + ",<br>Welcome to AURA Finance. Enter the 6-digit security code below into your verification screen to activate your private financial ledger:</p>" +
                        "<div style='background:linear-gradient(135deg,#18181b,#09090b);border:1px solid #3f3f46;border-radius:12px;padding:22px;text-align:center;margin-bottom:24px;'>" +
                        "<span style='font-size:36px;font-weight:900;letter-spacing:10px;color:#ffffff;font-family:monospace;'>" + otpCode + "</span>" +
                        "</div>" +
                        "<p style='color:#71717a;font-size:12px;line-height:1.5;margin:0 0 20px 0;'>This security verification code will expire in <strong>10 minutes</strong>.<br>If you did not initiate this registration request, you can safely ignore this email.</p>" +
                        "<hr style='border:none;border-top:1px solid #27272a;margin:24px 0;'>" +
                        "<p style='color:#52525b;font-size:11px;margin:0;font-family:monospace;'>AURA Finance &bull; End-to-End Tenancy &bull; Bank-Grade Security</p>" +
                        "</div></body></html>";

                String plainText = "Hello " + userName + ",\n\n" +
                        "Your AURA Finance 6-digit verification code is: " + otpCode + "\n\n" +
                        "This code will expire in 10 minutes.\n\n" +
                        "— The AURA Finance Team";
                helper.setText(plainText, html);
                mailSender.send(mimeMessage);
                log.info("Luxury HTML OTP email successfully dispatched to {}. Security Code: {}", to, otpCode);
            } catch (Exception e) {
                log.error("Failed to send HTML OTP email to {}: {}. Sending text fallback.", to, e.getMessage());
                sendEmail(to, "AURA Finance — Verification Code: " + otpCode,
                        "Hello " + userName + ",\n\nYour 6-digit verification code is:\n\n    " + otpCode +
                                "\n\nThis code will expire in 10 minutes.\n\n— The AURA Finance Team");
            }
        });
    }

    public void sendBudgetWarningEmail(String to, String userName, String category, String spent, String limit, double percent) {
        String subject = "AURA Alert: Budget Threshold Reached for " + category;
        String body = String.format(
                "Hello %s,\n\n" +
                "This is an automated notification from AURA Finance.\n" +
                "You have consumed %.1f%% of your monthly budget for '%s'.\n\n" +
                "Spent: \u20B9%s\n" +
                "Monthly Limit: \u20B9%s\n\n" +
                "You can review your spending in your AURA dashboard.\n\n" +
                "— The AURA Finance Team",
                userName, percent, category, spent, limit
        );
        sendEmail(to, subject, body);
    }

    public void sendBudgetExceededEmail(String to, String userName, String category, String spent, String limit) {
        String subject = "AURA Alert: Budget Exceeded for " + category;
        String body = String.format(
                "Hello %s,\n\n" +
                "Urgent Budget Alert: Your spending for '%s' has exceeded your monthly allocation.\n\n" +
                "Current Spent: \u20B9%s\n" +
                "Allocated Limit: \u20B9%s\n\n" +
                "Please review your recent transactions in the AURA dashboard.\n\n" +
                "— The AURA Finance Team",
                userName, category, spent, limit
        );
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String userName, String resetLink) {
        String subject = "AURA Finance: Password Reset Request";
        String body = String.format(
                "Hello %s,\n\n" +
                "We received a request to reset your AURA Finance account password.\n" +
                "Click the link below to set a new password:\n\n" +
                "%s\n\n" +
                "This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.\n\n" +
                "— The AURA Finance Team",
                userName, resetLink
        );
        sendEmail(to, subject, body);
    }
}
