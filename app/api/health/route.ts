import { NextRequest, NextResponse } from 'next/server'
import { healthCheck } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const health = await healthCheck()
    
    return NextResponse.json({
      success: true,
      ...health
    }, { 
      status: health.status === 'healthy' ? 200 : 503 
    })
  } catch (error: any) {
    console.error('Health check endpoint error:', error)
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      details: {
        connection: false,
        timestamp: new Date().toISOString()
      }
    }, { status: 503 })
  }
}