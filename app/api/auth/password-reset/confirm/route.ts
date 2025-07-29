import { NextRequest, NextResponse } from 'next/server'
import { passwordResetConfirmSchema } from '@/lib/validations'
import { AuthService } from '@/lib/services/auth.service'
import { APIError } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = passwordResetConfirmSchema.safeParse(body)
    if (!validationResult.success) {
      const error: APIError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid password reset data',
        details: validationResult.error.format(),
        timestamp: new Date()
      }
      return NextResponse.json({ error }, { status: 400 })
    }

    const { token, password } = validationResult.data

    // Reset password with token
    await AuthService.resetPassword(token, password)

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    })

  } catch (error) {
    console.error('Password reset confirm error:', error)
    
    const message = error instanceof Error ? error.message : 'Internal server error'
    
    // Map specific error messages to appropriate status codes
    let statusCode = 500
    let errorCode = 'INTERNAL_ERROR'
    
    if (message.includes('Invalid or expired reset token')) {
      statusCode = 400
      errorCode = 'INVALID_RESET_TOKEN'
    }
    
    const apiError: APIError = {
      code: errorCode,
      message,
      timestamp: new Date()
    }
    
    return NextResponse.json({ error: apiError }, { status: statusCode })
  }
}