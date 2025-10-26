package com.presstronic.kalsumed.profile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public class ProfileDtos {
  public record ReadResponse(Long id, String email, String displayName, String timeZone, boolean active) {}
  public record UpdateRequest(@NotBlank @Size(max=100) String displayName, @NotBlank @Size(max=64) String timeZone) {}
}
