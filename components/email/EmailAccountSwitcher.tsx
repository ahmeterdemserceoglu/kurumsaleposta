'use client';

import { useState, useEffect } from 'react';
import { EmailAccount, User } from '@/types';
import { EmailAPIService } from '@/lib/services/email.service';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, ChevronDown, Mail, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface EmailAccountSwitcherProps {
  currentUser: User;
  currentEmailAccount?: EmailAccount;
  onEmailAccountChange: (account: EmailAccount) => void;
  onCreateNewAccount: () => void;
  onManageAccounts: () => void;
}

export function EmailAccountSwitcher({
  currentUser,
  currentEmailAccount,
  onEmailAccountChange,
  onCreateNewAccount,
  onManageAccounts
}: EmailAccountSwitcherProps) {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's email accounts
  useEffect(() => {
    loadEmailAccounts();
  }, [currentUser.companyId]);

  const loadEmailAccounts = async () => {
    try {
      setLoading(true);
      const response = await EmailAPIService.getEmailAccounts(currentUser.companyId);
      setEmailAccounts(response.accounts);
    } catch (error) {
      console.error('Error loading email accounts:', error);
      toast.error('E-posta hesapları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Get user's initials for avatar
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  // Get current account or default to first account
  const activeAccount = currentEmailAccount || emailAccounts[0];

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-32"></div>
      </div>
    );
  }

  if (emailAccounts.length === 0) {
    return (
      <Button
        variant="outline"
        onClick={onCreateNewAccount}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        E-posta Hesabı Oluştur
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-50"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {activeAccount ? getInitials(activeAccount.email) : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {activeAccount?.email || 'E-posta seçin'}
            </span>
            {activeAccount && (
              <div className="flex items-center gap-1">
                <Badge 
                  variant={activeAccount.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {activeAccount.status === 'active' ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            )}
          </div>
          
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-80">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">E-posta Hesapları</p>
          <p className="text-xs text-muted-foreground">
            {emailAccounts.length} hesap mevcut
          </p>
        </div>
        
        <DropdownMenuSeparator />

        {/* Email Account List */}
        <div className="max-h-60 overflow-y-auto">
          {emailAccounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => onEmailAccountChange(account)}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                  {getInitials(account.email)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {account.email}
                  </span>
                  {activeAccount?.id === account.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={account.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {account.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Badge>
                  
                  {account.forwardingRules.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {account.forwardingRules.length} yönlendirme
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Action Items */}
        <DropdownMenuItem
          onClick={onCreateNewAccount}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Yeni E-posta Hesabı
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onManageAccounts}
          className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          Hesapları Yönet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}