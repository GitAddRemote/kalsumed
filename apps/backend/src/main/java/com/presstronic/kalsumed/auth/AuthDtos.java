package com.presstronic.kalsumed.auth;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
public class AuthDtos {
  public record RegisterRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
  public record TokenResponse(String token) {}
  public record ForgotPasswordRequest(@NotBlank @Email String email) {}
  public record ResetPasswordRequest(@NotBlank String token, @NotBlank String newPassword) {}
}
