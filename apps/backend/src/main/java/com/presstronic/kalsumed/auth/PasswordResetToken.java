package com.presstronic.kalsumed.auth;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "password_reset_token")
public class PasswordResetToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String token;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @Column(nullable = false)
  private Instant expiresAt;

  @Column(nullable = false)
  private boolean used = false;

  public PasswordResetToken() {}

  public PasswordResetToken(UserEntity user) {
    this.user = user;
    this.token = UUID.randomUUID().toString();
    this.expiresAt = Instant.now().plus(1, ChronoUnit.HOURS); // 1 hour expiry
  }

  public Long getId() { return id; }
  public String getToken() { return token; }
  public UserEntity getUser() { return user; }
  public Instant getExpiresAt() { return expiresAt; }
  public boolean isUsed() { return used; }
  public void setUsed(boolean used) { this.used = used; }

  public boolean isExpired() {
    return Instant.now().isAfter(expiresAt);
  }

  public boolean isValid() {
    return !used && !isExpired();
  }
}
