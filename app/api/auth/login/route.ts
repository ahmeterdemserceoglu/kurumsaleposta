import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { AuthService } from '@/lib/services/auth.service'
import { APIError } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      const error: APIError = {
        code: 'VALIDATION_ERROR',
        message: 'Geçersiz giriş bilgileri formatı',
        details: validationResult.error.format(),
        timestamp: new Date()
      }
      return NextResponse.json({ error }, { status: 400 })
    }

    const { email, password } = validationResult.data

    // Authenticate user
    const authResponse = await AuthService.authenticateUser({ email, password })

    // Set token as HTTP-only cookie for middleware
    const response = NextResponse.json(authResponse)
    response.cookies.set('auth_token', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    let message = error instanceof Error ? error.message : 'Internal server error'
    
    // Map specific error messages to appropriate status codes
    let statusCode = 500
    let errorCode = 'INTERNAL_ERROR'
    
    if (message.includes('Invalid email or password')) {
      statusCode = 401
      errorCode = 'INVALID_CREDENTIALS'
      message = 'Geçersiz e-posta veya şifre'
    } else if (message.includes('Account is inactive')) {
      statusCode = 403
      errorCode = 'ACCOUNT_INACTIVE'
      message = 'Hesap aktif değil'
    } else if (message.includes('Company account is suspended')) {
      statusCode = 403
      errorCode = 'COMPANY_SUSPENDED'
      message = 'Şirket hesabı askıya alınmış'
    } else {
      message = 'Sunucu hatası'
    }
    
    const apiError: APIError = {
      code: errorCode,
      message,
      timestamp: new Date()
    }
    
    return NextResponse.json({ error: apiError }, { status: statusCode })
  }
}