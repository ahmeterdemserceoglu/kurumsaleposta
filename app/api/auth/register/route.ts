import { NextRequest, NextResponse } from 'next/server'
import { registrationSchema } from '@/lib/validations'
import { AuthService } from '@/lib/services/auth.service'
import { APIError } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = registrationSchema.safeParse(body)
    if (!validationResult.success) {
      const error: APIError = {
        code: 'VALIDATION_ERROR',
        message: 'Geçersiz kayıt bilgileri formatı',
        details: validationResult.error.format(),
        timestamp: new Date()
      }
      return NextResponse.json({ error }, { status: 400 })
    }

    const registrationData = validationResult.data

    // Register company and admin user
    const authResponse = await AuthService.registerCompany(registrationData)

    // Set user info in response headers for client-side storage
    const response = NextResponse.json(authResponse, { status: 201 })
    
    return response

  } catch (error) {
    console.error('Registration error:', error)
    
    const originalMessage = error instanceof Error ? error.message : 'Internal server error'
    
    // Map specific error messages to appropriate status codes
    let statusCode = 500
    let errorCode = 'INTERNAL_ERROR'
    let message = 'Sunucu hatası'
    
    if (originalMessage.includes('Email address is already registered')) {
      statusCode = 409
      errorCode = 'EMAIL_ALREADY_EXISTS'
      message = 'Bu e-posta adresi zaten kayıtlı'
    } else if (originalMessage.includes('Domain is already registered')) {
      statusCode = 409
      errorCode = 'DOMAIN_ALREADY_EXISTS'
      message = 'Bu domain zaten kayıtlı'
    }
    
    const apiError: APIError = {
      code: errorCode,
      message,
      timestamp: new Date()
    }
    
    return NextResponse.json({ error: apiError }, { status: statusCode })
  }
}