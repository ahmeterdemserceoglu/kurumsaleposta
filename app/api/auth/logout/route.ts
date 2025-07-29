import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { APIError } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      // Even if no refresh token provided, return success
      // This allows for graceful logout even if token is missing
      return NextResponse.json({ success: true, message: 'Logged out successfully' })
    }

    // Invalidate refresh token
    await AuthService.logout(refreshToken)

    return NextResponse.json({ success: true, message: 'Logged out successfully' })

  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if logout fails on server side, we still want to allow client-side logout
    // So we return success but log the error
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  }
}