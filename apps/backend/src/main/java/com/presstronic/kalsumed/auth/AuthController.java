package com.presstronic.kalsumed.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final UserService users; private final JwtService jwt; private final AuthenticationManager authManager;
  private final StringRedisTemplate redis; private final LoginRateLimiter limiter;

  public AuthController(UserService users, JwtService jwt, AuthenticationManager authManager, StringRedisTemplate redis, LoginRateLimiter limiter){
    this.users=users; this.jwt=jwt; this.authManager=authManager; this.redis=redis; this.limiter=limiter;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest req){
    users.register(req.email(), req.password());
    return ResponseEntity.ok().build();
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(HttpServletRequest request, @Valid @RequestBody AuthDtos.LoginRequest req){
    String ip = request.getRemoteAddr();
    if(!limiter.allow(ip)) return ResponseEntity.status(429).body("Too many login attempts. Try again later.");
    Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
    String token = jwt.generate(req.email());
    return ResponseEntity.ok(new AuthDtos.TokenResponse(token));
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(HttpServletRequest request){
    final String authHeader = request.getHeader("Authorization");
    if(authHeader != null && authHeader.startsWith("Bearer ")){
      String token = authHeader.substring(7);
      var claims = jwt.parseClaims(token);
      String jti = claims.getId();
      if(jti != null){
        long ttlSec = Math.max(1, (claims.getExpiration().getTime() - System.currentTimeMillis())/1000);
        redis.opsForValue().set("jwt:blacklist:"+jti, "1", Duration.ofSeconds(ttlSec));
      }
    }
    return ResponseEntity.noContent().build();
  }
}
