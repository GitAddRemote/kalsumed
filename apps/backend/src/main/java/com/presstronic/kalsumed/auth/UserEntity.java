package com.presstronic.kalsumed.auth;

import com.presstronic.kalsumed.tenant.TenantEntity;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity @Table(name="app_user")
public class UserEntity implements UserDetails {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional=false, fetch=FetchType.LAZY) private TenantEntity tenant;
  @Column(unique=true, nullable=false) private String email;
  @Column(nullable=false) private String passwordHash;
  @Column(nullable=false) private boolean active=true;
  @Enumerated(EnumType.STRING)
  @Column(nullable=false) private UserRole role = UserRole.USER;
  private String displayName;
  private String timeZone;

  public UserEntity() {}
  public UserEntity(TenantEntity tenant, String email, String passwordHash){
    this.tenant=tenant; this.email=email; this.passwordHash=passwordHash;
  }
  public UserEntity(TenantEntity tenant, String email, String passwordHash, UserRole role){
    this.tenant=tenant; this.email=email; this.passwordHash=passwordHash; this.role=role;
  }

  public Long getId(){return id;} public TenantEntity getTenant(){return tenant;}
  public String getEmail(){return email;} public String getDisplayName(){return displayName;}
  public String getTimeZone(){return timeZone;} public UserRole getRole(){return role;}
  public void setDisplayName(String v){this.displayName=v;}
  public void setTimeZone(String v){this.timeZone=v;} public void setActive(boolean v){this.active=v;}
  public void setRole(UserRole v){this.role=v;}
  public void setPasswordHash(String v){this.passwordHash=v;}

  @Override public Collection<? extends GrantedAuthority> getAuthorities(){
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }
  @Override public String getPassword(){return passwordHash;}
  @Override public String getUsername(){return email;}
  @Override public boolean isAccountNonExpired(){return true;}
  @Override public boolean isAccountNonLocked(){return true;}
  @Override public boolean isCredentialsNonExpired(){return true;}
  @Override public boolean isEnabled(){return active;}
}
