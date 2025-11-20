package com.presstronic.kalsumed.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
  private final SecretKey key; private final long ttlSeconds;
  public JwtService(@Value("${app.jwt.secret:change-me}") String secret, @Value("${app.jwt.ttlSeconds:3600}") long ttlSeconds){
    this.key = Keys.hmacShaKeyFor(secret.getBytes()); this.ttlSeconds = ttlSeconds;
  }
  public String generate(String subject){
    Instant now = Instant.now();
    return Jwts.builder()
      .id(UUID.randomUUID().toString())
      .subject(subject)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plusSeconds(ttlSeconds)))
      .signWith(key).compact();
  }
  public Claims parseClaims(String token){
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
  public String parseSubject(String token){ return parseClaims(token).getSubject(); }
}
