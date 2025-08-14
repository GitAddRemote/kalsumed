export interface Role {
  id: string;
  name: string;
  slug: string;
}

export interface UserRole {
  role: Role;
}

export interface OAuthEmail {
  value: string;
  verified?: boolean;
}

export interface OAuthPhoto {
  value: string;
}

export interface OAuthProfile {
  id: string;
  provider: string;
  emails?: OAuthEmail[];
  photos?: OAuthPhoto[];
  name?: {
    givenName?: string;
    familyName?: string;
    middleName?: string;
  };
  displayName?: string;
  _json?: Record<string, unknown>;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

export interface AppleTokenPayload {
  sub: string;
  email?: string;
  exp?: number;
}
