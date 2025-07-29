import { User, AuthResponse, LoginCredentials, RegistrationData } from '@/types'
import { apiClient } from './api'

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

// JWT token utilities
export class TokenManager {
  // Store tokens in localStorage
  static setTokens(authResponse: AuthResponse): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.token)
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user))
    
    // Set token in API client
    apiClient.setAuthToken(authResponse.token)
  }

  // Get access token
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  // Get stored user data
  static getUser(): User | null {
    if (typeof window === 'undefined') return null
    
    const userData = localStorage.getItem(USER_KEY)
    if (!userData) return null
    
    try {
      return JSON.parse(userData) as User
    } catch {
      return null
    }
  }

  // Clear all tokens and user data
  static clearTokens(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    
    // Clear token from API client
    apiClient.clearAuthToken()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // Decode JWT token (basic implementation)
  static decodeToken(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token) as any
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token) as any
    if (!decoded || !decoded.exp) return null
    
    return new Date(decoded.exp * 1000)
  }
}

// Authentication service
export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    
    // Store tokens and user data
    TokenManager.setTokens(response)
    
    return response
  }

  // Register new user/company
  static async register(data: RegistrationData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    
    // Store tokens and user data
    TokenManager.setTokens(response)
    
    return response
  }

  // Logout user
  static async logout(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken()
    
    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/auth/logout', { refreshToken })
    } catch (error) {
      // Continue with local logout even if server request fails
      console.warn('Server logout failed:', error)
    } finally {
      // Always clear local tokens
      TokenManager.clearTokens()
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = TokenManager.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken
    })
    
    // Update stored tokens
    TokenManager.setTokens(response)
    
    return response
  }

  // Get current user
  static getCurrentUser(): User | null {
    return TokenManager.getUser()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken()
    if (!token) return false
    
    // Check if token is expired
    if (TokenManager.isTokenExpired(token)) {
      return false
    }
    
    return true
  }

  // Initialize auth state (call on app startup)
  static initializeAuth(): void {
    const token = TokenManager.getAccessToken()
    
    if (token && !TokenManager.isTokenExpired(token)) {
      // Set token in API client
      apiClient.setAuthToken(token)
    } else {
      // Clear expired tokens
      TokenManager.clearTokens()
    }
  }

  // Check user role
  static hasRole(role: 'admin' | 'employee'): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  // Check if user is admin
  static isAdmin(): boolean {
    return this.hasRole('admin')
  }

  // Check if user is employee
  static isEmployee(): boolean {
    return this.hasRole('employee')
  }

  // Get user's company ID
  static getCompanyId(): string | null {
    const user = this.getCurrentUser()
    return user?.companyId || null
  }

  // Password reset request
  static async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password-reset', { email })
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', {
      token,
      password: newPassword
    })
  }

  // Change password (authenticated user)
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
  }

  // Update user profile
  static async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', updates)
    
    // Update stored user data
    const currentAuth = TokenManager.getUser()
    if (currentAuth) {
      const updatedUser = { ...currentAuth, ...response }
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
    }
    
    return response
  }
}

// Auth guard hook for protecting routes
export function requireAuth(): User {
  const user = AuthService.getCurrentUser()
  
  if (!user || !AuthService.isAuthenticated()) {
    throw new Error('Authentication required')
  }
  
  return user
}

// Admin guard hook
export function requireAdmin(): User {
  const user = requireAuth()
  
  if (!AuthService.isAdmin()) {
    throw new Error('Admin access required')
  }
  
  return user
}

// Session management utilities
export class SessionManager {
  private static sessionCheckInterval: NodeJS.Timeout | null = null
  private static readonly CHECK_INTERVAL = 60000 // Check every minute

  // Start session monitoring
  static startSessionMonitoring(): void {
    if (typeof window === 'undefined') return

    this.sessionCheckInterval = setInterval(() => {
      const token = TokenManager.getAccessToken()
      
      if (token && TokenManager.isTokenExpired(token)) {
        // Try to refresh token
        AuthService.refreshToken().catch(() => {
          // If refresh fails, logout user
          AuthService.logout()
          
          // Redirect to login page
          window.location.href = '/login'
        })
      }
    }, this.CHECK_INTERVAL)
  }

  // Stop session monitoring
  static stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
  }

  // Extend session (call on user activity)
  static extendSession(): void {
    // This could trigger a token refresh or update last activity time
    const token = TokenManager.getAccessToken()
    if (token && !TokenManager.isTokenExpired(token)) {
      // Token is still valid, no action needed
      // In a real implementation, you might want to update last activity
    }
  }
}

// Initialize auth on module load
if (typeof window !== 'undefined') {
  AuthService.initializeAuth()
  SessionManager.startSessionMonitoring()
}