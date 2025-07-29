import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'employee'
  companyId: string
}

export interface RefreshTokenPayload {
  userId: string
  tokenVersion?: number
}

// Generate access token (1 hour expiry)
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'corporate-email-hosting',
    audience: 'corporate-email-users'
  })
}

// Generate refresh token (7 days expiry)
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'corporate-email-hosting',
    audience: 'corporate-email-users'
  })
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'corporate-email-hosting',
      audience: 'corporate-email-users'
    }) as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired access token')
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'corporate-email-hosting',
      audience: 'corporate-email-users'
    }) as RefreshTokenPayload
  } catch (error) {
    throw new Error('Invalid or expired refresh token')
  }
}

// Get token expiration date
export function getTokenExpiration(token: string): Date {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token format')
    }
    return new Date(decoded.exp * 1000)
  } catch (error) {
    throw new Error('Could not decode token expiration')
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const expiration = getTokenExpiration(token)
    return expiration.getTime() < Date.now()
  } catch (error) {
    return true
  }
}