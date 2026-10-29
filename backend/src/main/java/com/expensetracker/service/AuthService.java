package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.NotificationType;
import com.expensetracker.model.Role;
import com.expensetracker.model.User;
import com.expensetracker.model.UserStatus;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtTokenProvider;
import com.expensetracker.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       EmailService emailService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;

        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (existing.isEmailVerified()) {
                throw new ConflictException("An account with this email address already exists");
            }
            // User registered previously in pending state
            user = existing;
            user.setFullName(request.getFullName().trim());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmailVerified(true);
            user.setVerificationOtp(null);
            user.setVerificationOtpExpiresAt(null);
            user.setLastLoginAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
        } else {
            user = new User();
            user.setFullName(request.getFullName().trim());
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(Role.ROLE_USER);
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(true);
            user.setVerificationOtp(null);
            user.setVerificationOtpExpiresAt(null);
            user.setLastLoginAt(LocalDateTime.now());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
        }

        User savedUser = userRepository.save(user);

        // Welcome notification
        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to AURA Finance",
                "Your account has been established and your private financial ledger is active.",
                NotificationType.SYSTEM
        );

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, new UserSummaryDto(savedUser));
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No registration found for this email address"));

        if (user.isEmailVerified()) {
            UserPrincipal principal = UserPrincipal.create(user);
            String token = tokenProvider.generateToken(principal);
            return new AuthResponse(token, new UserSummaryDto(user));
        }

        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(request.getOtp().trim())) {
            throw new BadRequestException("Invalid 6-digit verification code");
        }

        if (user.getVerificationOtpExpiresAt() == null || user.getVerificationOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        user.setEmailVerified(true);
        user.setVerificationOtp(null);
        user.setVerificationOtpExpiresAt(null);
        user.setLastLoginAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        // Welcome notification
        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to AURA Finance",
                "Your email has been verified and your private financial ledger is active.",
                NotificationType.SYSTEM
        );

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, new UserSummaryDto(savedUser));
    }

    public void resendOtp(ResendOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email address"));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Your email address is already verified. Please sign in.");
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(1000000));
        user.setVerificationOtp(otp);
        user.setVerificationOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info(">>> RESENT 6-DIGIT OTP FOR {}: {} <<<", user.getEmail(), otp);

        emailService.sendRegistrationOtpEmail(user.getEmail(), user.getFullName(), otp);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Your account is currently suspended. Please contact administrator support.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, new UserSummaryDto(user));
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            String resetLink = baseUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);

            notificationService.createNotification(
                    user.getId(),
                    "Password Reset Requested",
                    "A password reset request was initiated for your account. If this was not you, please secure your account.",
                    NotificationType.SYSTEM
            );
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (user.getResetPasswordExpiresAt() == null || user.getResetPasswordExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Password Successfully Updated",
                "Your account password was updated successfully. You can now use your new password to sign in.",
                NotificationType.SYSTEM
        );
    }

    public void changePassword(String userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Password Changed",
                "Your account password was updated successfully via Account Settings.",
                NotificationType.SYSTEM
        );
    }

    public UserSummaryDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return new UserSummaryDto(user);
    }
}
