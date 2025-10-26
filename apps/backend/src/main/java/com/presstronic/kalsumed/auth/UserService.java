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
  private final UserRepository repo; private final TenantRepository tenants; private final PasswordEncoder encoder;
  public UserService(UserRepository repo, TenantRepository tenants, PasswordEncoder encoder){this.repo=repo; this.tenants=tenants; this.encoder=encoder;}

  @Override public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return repo.findByEmail(username).orElseThrow(()->new UsernameNotFoundException("User not found"));
  }

  @Transactional
  public UserEntity register(String email, String rawPassword){
    if(repo.existsByEmail(email)) throw new IllegalArgumentException("Email already registered");
    TenantEntity tenant = tenants.findBySlug("default").orElseThrow(()->new IllegalStateException("Default tenant missing"));
    String hash = encoder.encode(rawPassword);
    return repo.save(new UserEntity(tenant, email, hash));
  }
}
