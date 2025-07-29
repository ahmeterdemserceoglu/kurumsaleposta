import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/emails/folders - Get email folders with message counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get folder counts
    const folderCounts = await executeQuery<any>(
      `SELECT 
        folder,
        COUNT(*) as count,
        SUM(CASE WHEN isRead = false THEN 1 ELSE 0 END) as unreadCount
       FROM email_messages 
       WHERE emailAccountId = ?
       GROUP BY folder`,
      [accountId]
    );

    // Define standard folders
    const standardFolders = [
      { name: 'inbox', displayName: 'Gelen Kutusu', icon: 'inbox', type: 'system' },
      { name: 'sent', displayName: 'Gönderilen', icon: 'send', type: 'system' },
      { name: 'drafts', displayName: 'Taslaklar', icon: 'file-text', type: 'system' },
      { name: 'spam', displayName: 'Spam', icon: 'shield', type: 'system' },
      { name: 'trash', displayName: 'Çöp Kutusu', icon: 'trash', type: 'system' }
    ];

    // Merge with counts
    const folders = standardFolders.map(folder => {
      const folderData = folderCounts.find(fc => fc.folder === folder.name);
      return {
        ...folder,
        count: folderData?.count || 0,
        unreadCount: folderData?.unreadCount || 0
      };
    });

    return NextResponse.json({ folders });

  } catch (error) {
    console.error('Error fetching email folders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}