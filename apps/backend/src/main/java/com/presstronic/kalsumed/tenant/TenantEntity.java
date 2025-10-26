package com.presstronic.kalsumed.tenant;

import jakarta.persistence.*;

@Entity @Table(name = "tenant")
public class TenantEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false, unique = true) private String slug;
  @Column(nullable = false) private String name;
  public TenantEntity() {} public TenantEntity(String slug, String name){this.slug=slug;this.name=name;}
  public Long getId(){return id;} public String getSlug(){return slug;} public String getName(){return name;}
}
