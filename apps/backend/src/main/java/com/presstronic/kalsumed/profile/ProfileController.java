package com.presstronic.kalsumed.profile;

import com.presstronic.kalsumed.auth.UserEntity;
import com.presstronic.kalsumed.auth.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api")
public class ProfileController {
  private final UserRepository users;
  public ProfileController(UserRepository users){this.users=users;}

  @GetMapping("/me")
  public ResponseEntity<ProfileDtos.ReadResponse> me(@AuthenticationPrincipal UserEntity user){
    return ResponseEntity.ok(new ProfileDtos.ReadResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.getTimeZone(), user.isEnabled()));
  }
  @GetMapping("/profile") public ResponseEntity<ProfileDtos.ReadResponse> read(@AuthenticationPrincipal UserEntity user){ return me(user); }

  @PutMapping("/profile") @Transactional
  public ResponseEntity<ProfileDtos.ReadResponse> update(@AuthenticationPrincipal UserEntity user, @Valid @RequestBody ProfileDtos.UpdateRequest req){
    user.setDisplayName(req.displayName()); user.setTimeZone(req.timeZone()); users.save(user); return read(user);
  }

  @DeleteMapping("/profile") @Transactional
  public ResponseEntity<?> delete(@AuthenticationPrincipal UserEntity user){
    user.setActive(false); users.save(user); return ResponseEntity.noContent().build();
  }
}
