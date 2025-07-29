import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/users - Get users without email accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get users who don't have email accounts yet
    const users = await executeQuery<any>(
      `SELECT 
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.role,
        u.companyId,
        u.status
       FROM users u
       LEFT JOIN email_accounts ea ON u.id = ea.userId
       WHERE u.companyId = ? AND u.status = 'active' AND ea.id IS NULL
       ORDER BY u.firstName, u.lastName`,
      [companyId]
    );

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}