export interface User {
  id: number;
  email: string;
  displayName: string | null;
  timeZone: string | null;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'USER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}
