package com.presstronic.kalsumed.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService; private final UserDetailsService uds; private final StringRedisTemplate redis;

  public JwtAuthFilter(JwtService jwtService, UserDetailsService uds, StringRedisTemplate redis){
    this.jwtService = jwtService; this.uds = uds; this.redis = redis;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    final String authHeader = request.getHeader("Authorization");
    if(authHeader == null || !authHeader.startsWith("Bearer ")){ chain.doFilter(request, response); return; }
    String token = authHeader.substring(7);
    try {
      var claims = jwtService.parseClaims(token);
      String jti = claims.getId();
      if (jti != null && Boolean.TRUE.equals(redis.hasKey("jwt:blacklist:"+jti))) {
        chain.doFilter(request, response); return;
      }
      String subject = claims.getSubject();
      UserDetails user = uds.loadUserByUsername(subject);
      var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
      auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(auth);
    } catch(Exception ignored){}
    chain.doFilter(request, response);
  }
}
