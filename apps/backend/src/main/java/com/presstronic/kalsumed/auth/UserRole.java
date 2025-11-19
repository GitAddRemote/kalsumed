package com.presstronic.kalsumed.auth;

/**
 * User roles for multi-tenant application.
 *
 * SUPER_ADMIN: Kalsumed representatives who can manage all tenants and create new organizations
 * ORG_ADMIN: Organization administrators who can manage their own tenant
 * USER: Regular users within a tenant
 */
public enum UserRole {
  SUPER_ADMIN,  // Can manage all tenants, create new tenants
  ORG_ADMIN,    // Can manage their own organization/tenant
  USER          // Regular user within a tenant
}
