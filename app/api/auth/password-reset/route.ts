import { NextRequest, NextResponse } from 'next/server'
import { passwordResetSchema } from '@/lib/validations'
import { AuthService } from '@/lib/services/auth.service'
import { APIError } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = passwordResetSchema.safeParse(body)
    if (!validationResult.success) {
      const error: APIError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
        details: validationResult.error.format(),
        timestamp: new Date()
      }
      return NextResponse.json({ error }, { status: 400 })
    }

    const { email } = validationResult.data

    // Request password reset
    await AuthService.requestPasswordReset(email)

    // Always return success to prevent email enumeration
    return NextResponse.json({ 
      success: true, 
      message: 'If the email exists, a password reset link has been sent' 
    })

  } catch (error) {
    console.error('Password reset request error:', error)
    
    // Don't reveal internal errors for security
    return NextResponse.json({ 
      success: true, 
      message: 'If the email exists, a password reset link has been sent' 
    })
  }
}