'use client';

import { useState, useEffect } from 'react';
import { EmailAccount } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Inbox, 
  Send, 
  FileText, 
  Shield, 
  Trash, 
  Plus,
  Folder,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailSidebarProps {
  currentAccount: EmailAccount;
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  companyPlan: string;
}

interface EmailFolder {
  name: string;
  displayName: string;
  icon: string;
  type: 'system' | 'custom';
  count: number;
  unreadCount: number;
}

export function EmailSidebar({
  currentAccount,
  selectedFolder,
  onFolderSelect,
  companyPlan
}: EmailSidebarProps) {
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [loading, setLoading] = useState(true);

  // Get storage limit based on company plan
  const getStorageLimit = (plan: string) => {
    switch (plan) {
      case 'starter': return { limit: 5, unit: 'GB' }; // 5 GB
      case 'business': return { limit: 25, unit: 'GB' }; // 25 GB
      case 'enterprise': return { limit: 100, unit: 'GB' }; // 100 GB
      default: return { limit: 5, unit: 'GB' }; // Default to starter
    }
  };

  const storageInfo = getStorageLimit(companyPlan);
  const storageLimitBytes = storageInfo.limit * 1024 * 1024 * 1024; // Convert GB to bytes

  // Load folders
  useEffect(() => {
    loadFolders();
  }, [currentAccount.id]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => loadFolders();
    window.addEventListener('refreshEmails', handleRefresh);
    return () => window.removeEventListener('refreshEmails', handleRefresh);
  }, [currentAccount.id]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emails/folders?accountId=${currentAccount.id}`);
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'inbox': return Inbox;
      case 'send': return Send;
      case 'file-text': return FileText;
      case 'shield': return Shield;
      case 'trash': return Trash;
      case 'folder': return Folder;
      default: return Folder;
    }
  };

  return (
    <div className="h-full border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Klasörler
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {folders.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3">
                  Klasör yükleniyor...
                </div>
              ) : (
                folders.map((folder) => {
                  console.log('Rendering folder:', folder); // Debug
                  const IconComponent = getFolderIcon(folder.icon);
                  const isSelected = selectedFolder === folder.name;
                  
                  return (
                    <Button
                      key={folder.name}
                      variant={isSelected ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10 px-3",
                        isSelected && "bg-secondary"
                      )}
                      onClick={() => onFolderSelect(folder.name)}
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      <span className="flex-1 text-left">{folder.displayName}</span>
                      
                      <div className="flex items-center gap-1">
                        {folder.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs px-1.5 py-0.5">
                            {folder.unreadCount}
                          </Badge>
                        )}
                        {folder.count > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {folder.count}
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Storage Info */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between items-center mb-2">
            <span>Depolama</span>
            <span>{Math.round(currentAccount.storageUsed / 1024 / 1024)} MB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ 
                width: `${Math.min((currentAccount.storageUsed / storageLimitBytes) * 100, 100)}%` 
              }}
            />
          </div>
          <div className="text-center mt-1">
            {storageInfo.limit} {storageInfo.unit}'dan {Math.round(currentAccount.storageUsed / 1024 / 1024)} MB kullanıldı
          </div>
        </div>
      </div>
    </div>
  );
}