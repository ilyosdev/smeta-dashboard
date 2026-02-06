/**
 * Token management utilities for JWT authentication
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Get the access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store both access and refresh tokens
 */
export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

/**
 * Clear all tokens from storage
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    // Decode JWT token (format: header.payload.signature)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if exp field exists
    if (!payload.exp) return true;
    
    // Compare expiration time with current time (exp is in seconds, Date.now() is in ms)
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    // If token is malformed, consider it expired
    return true;
  }
}
