import { NextRequest, NextResponse } from 'next/server';
import { EmailAccount, ForwardingRule } from '@/types';
import { executeQuery, executeQuerySingle } from '@/lib/database';

// GET /api/emails/accounts/[id] - Get single email account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const account = await executeQuerySingle<any>(
      `SELECT 
        id,
        email,
        userId,
        companyId,
        forwardingRules,
        storageUsed,
        status,
        createdAt
       FROM email_accounts 
       WHERE id = ?`,
      [id]
    );

    if (!account) {
      return NextResponse.json(
        { error: 'Email account not found' },
        { status: 404 }
      );
    }

    // Parse forwarding rules JSON
    const formattedAccount = {
      ...account,
      forwardingRules: JSON.parse(account.forwardingRules || '[]')
    };

    return NextResponse.json(formattedAccount);

  } catch (error) {
    console.error('Error fetching email account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/emails/accounts/[id] - Update email account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if account exists
    const existingAccount = await executeQuerySingle(
      'SELECT id FROM email_accounts WHERE id = ?',
      [id]
    );

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Email account not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const allowedFields = ['status', 'forwardingRules', 'storageUsed'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(body).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(key === 'forwardingRules' ? JSON.stringify(value) : value);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(id);

    // Update account
    await executeQuery(
      `UPDATE email_accounts SET ${updateFields.join(', ')}, updatedAt = NOW() WHERE id = ?`,
      updateValues
    );

    // Get updated account
    const updatedAccount = await executeQuerySingle<any>(
      `SELECT 
        id,
        email,
        userId,
        companyId,
        forwardingRules,
        storageUsed,
        status,
        createdAt
       FROM email_accounts 
       WHERE id = ?`,
      [id]
    );

    // Parse forwarding rules JSON
    const formattedAccount = {
      ...updatedAccount,
      forwardingRules: JSON.parse(updatedAccount.forwardingRules || '[]')
    };

    return NextResponse.json(formattedAccount);

  } catch (error) {
    console.error('Error updating email account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/emails/accounts/[id] - Delete email account with data retention
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const retainData = searchParams.get('retainData') === 'true';

    // Check if account exists
    const account = await executeQuerySingle<any>(
      `SELECT 
        id,
        email,
        userId,
        companyId,
        forwardingRules,
        storageUsed,
        status,
        createdAt
       FROM email_accounts 
       WHERE id = ?`,
      [id]
    );

    if (!account) {
      return NextResponse.json(
        { error: 'Email account not found' },
        { status: 404 }
      );
    }

    if (retainData) {
      // Soft delete - mark as inactive but retain data
      await executeQuery(
        'UPDATE email_accounts SET status = ?, updatedAt = NOW() WHERE id = ?',
        ['inactive', id]
      );

      const updatedAccount = {
        ...account,
        status: 'inactive',
        forwardingRules: JSON.parse(account.forwardingRules || '[]')
      };

      return NextResponse.json({
        message: 'Email account deactivated, data retained',
        account: updatedAccount
      });
    } else {
      // Hard delete - remove account completely
      await executeQuery(
        'DELETE FROM email_accounts WHERE id = ?',
        [id]
      );

      return NextResponse.json({
        message: 'Email account deleted permanently',
        deletedAccountId: id
      });
    }

  } catch (error) {
    console.error('Error deleting email account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}