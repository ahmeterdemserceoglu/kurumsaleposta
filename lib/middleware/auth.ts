import { NextRequest } from 'next/server'
import { verifyAccessToken, JWTPayload } from '@/lib/jwt'
import { executeQuerySingle } from '@/lib/database'
import { User } from '@/types'

export interface AuthenticatedRequest extends NextRequest {
  user: User
}

// Extract token from Authorization header
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

// Verify and decode JWT token
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    return verifyAccessToken(token)
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

// Get user from database by ID
export async function getUserFromDatabase(userId: string): Promise<User | null> {
  try {
    const user = await executeQuerySingle<any>(
      `SELECT 
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.role,
        u.companyId,
        u.status,
        u.lastLogin,
        c.status as companyStatus
      FROM users u
      JOIN companies c ON u.companyId = c.id
      WHERE u.id = ?`,
      [userId]
    )

    if (!user) {
      return null
    }

    // Check if user and company are active
    if (user.status !== 'active' || user.companyStatus !== 'active') {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      status: user.status,
      lastLogin: user.lastLogin
    }
  } catch (error) {
    console.error('Error fetching user from database:', error)
    return null
  }
}

// Main authentication middleware function
export async function authenticateRequest(request: NextRequest): Promise<User> {
  // Extract token from header
  const token = extractTokenFromHeader(request)
  
  if (!token) {
    throw new Error('No authentication token provided')
  }

  // Verify token
  const payload = await verifyToken(token)

  // Get user from database
  const user = await getUserFromDatabase(payload.userId)
  
  if (!user) {
    throw new Error('User not found or inactive')
  }

  return user
}

// Middleware wrapper for API routes
export function withAuth(
  handler: (request: NextRequest, user: User) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const user = await authenticateRequest(request)
      return await handler(request, user)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      
      return new Response(
        JSON.stringify({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message,
            timestamp: new Date()
          }
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// Admin-only middleware wrapper
export function withAdminAuth(
  handler: (request: NextRequest, user: User) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const user = await authenticateRequest(request)
      
      if (user.role !== 'admin') {
        return new Response(
          JSON.stringify({
            error: {
              code: 'ADMIN_ACCESS_REQUIRED',
              message: 'Admin access required',
              timestamp: new Date()
            }
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      return await handler(request, user)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      
      return new Response(
        JSON.stringify({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message,
            timestamp: new Date()
          }
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(request: NextRequest): Promise<User | null> {
  try {
    return await authenticateRequest(request)
  } catch (error) {
    return null
  }
}