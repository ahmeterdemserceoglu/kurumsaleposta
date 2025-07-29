import { NextRequest, NextResponse } from 'next/server';
import { EmailAccount, ForwardingRule } from '@/types';
import { forwardingRuleSchema } from '@/lib/validations';
import { executeQuery, executeQuerySingle } from '@/lib/database';

// GET /api/emails/accounts/[id]/forwarding - Get forwarding rules for account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if account exists and get forwarding rules
    const account = await executeQuerySingle<any>(
      `SELECT 
        id,
        email,
        forwardingRules
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
    const forwardingRules = JSON.parse(account.forwardingRules || '[]');

    return NextResponse.json(forwardingRules);

  } catch (error) {
    console.error('Error fetching forwarding rules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/emails/accounts/[id]/forwarding - Create forwarding rule
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = forwardingRuleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { fromAddress, toAddress, isActive = true } = validationResult.data;

    // Check if account exists and get current forwarding rules
    const account = await executeQuerySingle<any>(
      `SELECT 
        id,
        email,
        forwardingRules
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

    // Parse current forwarding rules
    const currentRules = JSON.parse(account.forwardingRules || '[]');

    // Check if forwarding rule already exists
    const existingRule = currentRules.find(
      (rule: ForwardingRule) => rule.fromAddress === fromAddress && rule.toAddress === toAddress
    );

    if (existingRule) {
      return NextResponse.json(
        { error: 'Forwarding rule already exists' },
        { status: 409 }
      );
    }

    // Create new forwarding rule
    const newRule: ForwardingRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromAddress,
      toAddress,
      isActive
    };

    // Add new rule to existing rules
    const updatedRules = [...currentRules, newRule];

    // Update database with new forwarding rules
    await executeQuery(
      'UPDATE email_accounts SET forwardingRules = ?, updatedAt = NOW() WHERE id = ?',
      [JSON.stringify(updatedRules), id]
    );

    return NextResponse.json(newRule, { status: 201 });

  } catch (error) {
    console.error('Error creating forwarding rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}