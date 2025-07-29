import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { APIError } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      const error: APIError = {
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required',
        timestamp: new Date()
      }
      return NextResponse.json({ error }, { status: 400 })
    }

    // Refresh access token
    const authResponse = await AuthService.refreshAccessToken(refreshToken)

    return NextResponse.json(authResponse)

  } catch (error) {
    console.error('Token refresh error:', error)
    
    const message = error instanceof Error ? error.message : 'Internal server error'
    
    // Map specific error messages to appropriate status codes
    let statusCode = 500
    let errorCode = 'INTERNAL_ERROR'
    
    if (message.includes('Invalid or expired refresh token')) {
      statusCode = 401
      errorCode = 'INVALID_REFRESH_TOKEN'
    } else if (message.includes('User not found or inactive')) {
      statusCode = 401
      errorCode = 'USER_NOT_FOUND'
    }
    
    const apiError: APIError = {
      code: errorCode,
      message,
      timestamp: new Date()
    }
    
    return NextResponse.json({ error: apiError }, { status: statusCode })
  }
}