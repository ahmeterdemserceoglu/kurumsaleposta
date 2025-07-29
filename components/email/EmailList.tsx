'use client';

import { useState, useEffect } from 'react';
import { EmailMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail,
  MailOpen,
  Paperclip,
  Star,
  Archive,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface EmailListProps {
  accountId: string;
  folder: string;
  searchQuery: string;
  selectedMessage: EmailMessage | null;
  onMessageSelect: (message: EmailMessage) => void;
}

export function EmailList({
  accountId,
  folder,
  searchQuery,
  selectedMessage,
  onMessageSelect
}: EmailListProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Load messages when folder or search changes
  useEffect(() => {
    loadMessages();
  }, [accountId, folder, searchQuery]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => loadMessages();
    const handleSearch = (event: any) => {
      if (event.detail?.query !== undefined) {
        loadMessages();
      }
    };

    window.addEventListener('refreshEmails', handleRefresh);
    window.addEventListener('searchEmails', handleSearch);

    return () => {
      window.removeEventListener('refreshEmails', handleRefresh);
      window.removeEventListener('searchEmails', handleSearch);
    };
  }, [accountId, folder, searchQuery]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        accountId,
        folder,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/emails/messages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (messageId: string, selected: boolean) => {
    const newSelected = new Set(selectedMessages);
    if (selected) {
      newSelected.add(messageId);
    } else {
      newSelected.delete(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    } else {
      setSelectedMessages(new Set());
    }
  };

  const formatMessageTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: tr });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="h-full border-r">
        <div className="p-4 border-b">
          <div className="h-6 bg-muted rounded animate-pulse" />
        </div>
        <div className="p-2 space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border-r bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedMessages.size === messages.length && messages.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <h3 className="font-medium">
              {folder === 'inbox' && 'Gelen Kutusu'}
              {folder === 'sent' && 'Gönderilen'}
              {folder === 'drafts' && 'Taslaklar'}
              {folder === 'spam' && 'Spam'}
              {folder === 'trash' && 'Çöp Kutusu'}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {pagination.total}
            </Badge>
          </div>

          {selectedMessages.size > 0 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Message List */}
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Bu klasörde e-posta yok</h3>
            <p className="text-sm">
              {searchQuery ? 'Arama kriterlerinize uygun e-posta bulunamadı.' : 'Henüz e-posta almadınız.'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((message) => {
              const isSelected = selectedMessage?.id === message.id;
              const isChecked = selectedMessages.has(message.id);

              return (
                <div
                  key={message.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    isSelected && "bg-muted",
                    !message.isRead && "bg-blue-50/50"
                  )}
                  onClick={() => onMessageSelect(message)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked: boolean) => handleSelectMessage(message.id, checked)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {message.isRead ? (
                            <MailOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Mail className="h-4 w-4 text-primary" />
                          )}
                          <span className={cn(
                            "text-sm truncate",
                            !message.isRead && "font-semibold"
                          )}>
                            {folder === 'sent' ?
                              (message.to || []).join(', ') :
                              message.from
                            }
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {message.attachments && message.attachments.length > 0 && (
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-1">
                        <span className={cn(
                          "text-sm",
                          !message.isRead && "font-medium"
                        )}>
                          {message.subject || '(Konu yok)'}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {truncateText(message.body.replace(/<[^>]*>/g, ''))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Önceki
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}