package com.presstronic.kalsumed.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Email service for sending authentication-related emails.
 * TODO: Implement actual email sending (SMTP, SendGrid, AWS SES, etc.)
 */
@Service
public class EmailService {
  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  /**
   * Send password reset email with token.
   * For now, just logs the token - implement actual email sending later.
   *
   * @param email recipient email
   * @param token password reset token
   */
  public void sendPasswordResetEmail(String email, String token) {
    // TODO: Replace with actual email sending
    log.info("=".repeat(80));
    log.info("PASSWORD RESET EMAIL");
    log.info("To: {}", email);
    log.info("Reset Token: {}", token);
    log.info("Reset URL: http://localhost:3000/reset-password?token={}", token);
    log.info("=".repeat(80));

    // In production, send actual email:
    // emailTemplate.sendPasswordReset(email, token);
  }
}
