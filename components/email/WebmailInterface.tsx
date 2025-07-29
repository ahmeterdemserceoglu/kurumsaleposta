'use client';

import { useState, useEffect } from 'react';
import { EmailAccount, EmailMessage, User } from '@/types';
import { EmailSidebar } from './EmailSidebar';
import { EmailList } from './EmailList';
import { EmailViewer } from './EmailViewer';
import { EmailComposer } from './EmailComposer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Search, Plus, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface WebmailInterfaceProps {
  currentUser: User;
  currentEmailAccount: EmailAccount;
  onAccountChange: (account: EmailAccount) => void;
  companyPlan: string;
}

export function WebmailInterface({
  currentUser,
  currentEmailAccount,
  onAccountChange,
  companyPlan
}: WebmailInterfaceProps) {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle folder selection
  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedMessage(null); // Clear selected message when changing folders
  };

  // Handle message selection
  const handleMessageSelect = async (message: EmailMessage) => {
    setSelectedMessage(message);
    
    // Mark as read if not already read
    if (!message.isRead) {
      try {
        await fetch(`/api/emails/messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true })
        });
        
        // Update local state
        message.isRead = true;
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  // Handle compose
  const handleCompose = () => {
    setShowComposer(true);
    setSelectedMessage(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Trigger refresh in child components
    window.dispatchEvent(new CustomEvent('refreshEmails'));
    setTimeout(() => setLoading(false), 1000);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Trigger search in EmailList component
    window.dispatchEvent(new CustomEvent('searchEmails', { detail: { query } }));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {currentEmailAccount.email}
            </h1>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompose}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Yeni E-posta
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="E-postalarda ara..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <EmailSidebar
              currentAccount={currentEmailAccount}
              selectedFolder={selectedFolder}
              onFolderSelect={handleFolderSelect}
              companyPlan={companyPlan}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Email List */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <EmailList
              accountId={currentEmailAccount.id}
              folder={selectedFolder}
              searchQuery={searchQuery}
              selectedMessage={selectedMessage}
              onMessageSelect={handleMessageSelect}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Email Viewer/Composer */}
          <ResizablePanel defaultSize={45} minSize={30}>
            {showComposer ? (
              <EmailComposer
                currentAccount={currentEmailAccount}
                onClose={() => setShowComposer(false)}
                onSent={() => {
                  setShowComposer(false);
                  handleRefresh();
                  toast.success('E-posta gönderildi');
                }}
              />
            ) : selectedMessage ? (
              <EmailViewer
                message={selectedMessage}
                currentAccount={currentEmailAccount}
                onReply={() => {
                  setShowComposer(true);
                  setSelectedMessage(null);
                }}
                onDelete={() => {
                  setSelectedMessage(null);
                  handleRefresh();
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">E-posta seçin</h3>
                  <p className="text-sm">
                    Okumak için sol taraftan bir e-posta seçin veya yeni e-posta oluşturun
                  </p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}