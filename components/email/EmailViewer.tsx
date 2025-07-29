'use client';

import { useState } from 'react';
import { EmailMessage, EmailAccount } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Star,
  MoreHorizontal,
  Paperclip,
  Download,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface EmailViewerProps {
  message: EmailMessage;
  currentAccount: EmailAccount;
  onReply: () => void;
  onDelete: () => void;
}

export function EmailViewer({
  message,
  currentAccount,
  onReply,
  onDelete
}: EmailViewerProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emails/messages/${message.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emails/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'archive' })
      });

      if (response.ok) {
        // Refresh the email list
        window.dispatchEvent(new CustomEvent('refreshEmails'));
      }
    } catch (error) {
      console.error('Error archiving message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEmailDate = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return format(date, 'dd MMMM yyyy, HH:mm', { locale: tr });
  };

  const getInitials = (email: string) => {
    if (!email) return '?';
    const name = email.split('@')[0];
    const parts = name.split('.');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-full bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReply}>
              <Reply className="h-4 w-4 mr-2" />
              Yanıtla
            </Button>
            <Button variant="outline" size="sm">
              <ReplyAll className="h-4 w-4 mr-2" />
              Tümünü Yanıtla
            </Button>
            <Button variant="outline" size="sm">
              <Forward className="h-4 w-4 mr-2" />
              İlet
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleArchive} disabled={loading}>
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Subject */}
        <h1 className="text-xl font-semibold mb-4">
          {message.subject || '(Konu yok)'}
        </h1>

        {/* Sender Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
            {getInitials(message.from)}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{message.from}</div>
                <div className="text-sm text-muted-foreground">
                  Kime: {(message.to || []).join(', ')}
                </div>
                {message.cc && message.cc.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    CC: {(message.cc || []).join(', ')}
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {formatEmailDate(message.timestamp)}
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="h-4 w-4" />
              <span className="text-sm font-medium">
                {message.attachments.length} ek dosya
              </span>
            </div>
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{attachment.filename}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(attachment.size / 1024)} KB
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message Body */}
      <ScrollArea className="flex-1 p-4">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: message.body }}
        />
      </ScrollArea>
    </div>
  );
}