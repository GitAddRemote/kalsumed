package com.presstronic.kalsumed.auth;

import com.presstronic.kalsumed.tenant.TenantEntity;
import com.presstronic.kalsumed.tenant.TenantRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService implements UserDetailsService {
  private final UserRepository repo;
  private final TenantRepository tenants;
  private final PasswordEncoder encoder;
  private final PasswordResetTokenRepository resetTokenRepo;
  private final EmailService emailService;

  public UserService(UserRepository repo, TenantRepository tenants, PasswordEncoder encoder,
                     PasswordResetTokenRepository resetTokenRepo, EmailService emailService) {
    this.repo = repo;
    this.tenants = tenants;
    this.encoder = encoder;
    this.resetTokenRepo = resetTokenRepo;
    this.emailService = emailService;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return repo.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }

  @Transactional
  public UserEntity register(String email, String rawPassword) {
    if (repo.existsByEmail(email)) throw new IllegalArgumentException("Email already registered");
    TenantEntity tenant = tenants.findBySlug("default")
        .orElseThrow(() -> new IllegalStateException("Default tenant missing"));
    String hash = encoder.encode(rawPassword);
    return repo.save(new UserEntity(tenant, email, hash));
  }

  @Transactional
  public void initiatePasswordReset(String email) {
    // Find user, but don't reveal if email exists (security best practice)
    repo.findByEmail(email).ifPresent(user -> {
      // Delete any existing tokens for this user
      resetTokenRepo.deleteByUser(user);

      // Create new reset token
      PasswordResetToken token = new PasswordResetToken(user);
      resetTokenRepo.save(token);

      // Send email with token
      emailService.sendPasswordResetEmail(email, token.getToken());
    });

    // Always return success to prevent email enumeration attacks
  }

  @Transactional
  public void resetPassword(String token, String newPassword) {
    PasswordResetToken resetToken = resetTokenRepo.findByToken(token)
        .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

    if (!resetToken.isValid()) {
      throw new IllegalArgumentException("Invalid or expired reset token");
    }

    UserEntity user = resetToken.getUser();
    user.setActive(true); // Reactivate account if it was deactivated

    String hash = encoder.encode(newPassword);
    user.setPasswordHash(hash);
    repo.save(user);

    // Mark token as used
    resetToken.setUsed(true);
    resetTokenRepo.save(resetToken);
  }
}
