'use client';

import { useState, useEffect } from 'react';
import { EmailAccount, User } from '@/types';
import { WebmailInterface } from '@/components/email/WebmailInterface';
import { EmailHeader } from '@/components/layout/EmailHeader';
import { EmailAPIService } from '@/lib/services/email.service';
import { TokenManager } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

// Get current user from TokenManager
const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    return TokenManager.getUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get company info from database
const getCompanyInfo = async (companyId: string): Promise<{ maxEmailAccounts: number; plan: string }> => {
  try {
    const response = await fetch(`/api/companies/${companyId}`);
    if (response.ok) {
      const company = await response.json();
      return {
        maxEmailAccounts: company.settings?.maxEmailAccounts || 10,
        plan: company.plan || 'starter'
      };
    }
  } catch (error) {
    console.error('Error fetching company info:', error);
  }

  // Fallback
  return {
    maxEmailAccounts: 10,
    plan: 'starter'
  };
};

export default function EmailManagementPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentEmailAccount, setCurrentEmailAccount] = useState<EmailAccount | null>(null);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [companyInfo, setCompanyInfo] = useState<{ maxEmailAccounts: number; plan: string }>({
    maxEmailAccounts: 10,
    plan: 'starter'
  });
  const [loading, setLoading] = useState(true);

  // Initialize user on client side
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Load email accounts and company info
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser?.companyId]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      console.log('Email Page - Current user:', currentUser); // Debug log
      console.log('Email Page - Loading data for companyId:', currentUser.companyId); // Debug log

      // Load company info
      const companyData = await getCompanyInfo(currentUser.companyId);
      setCompanyInfo(companyData);

      // Load email accounts
      const response = await EmailAPIService.getEmailAccounts(currentUser.companyId);
      console.log('Email Page - API response:', response); // Debug log
      setEmailAccounts(response.accounts);

      // Set current email account to the first one (primary account)
      if (response.accounts.length > 0) {
        // Find the account that matches the current user's email (primary account)
        const primaryAccount = response.accounts.find(account => account.email === currentUser.email);
        setCurrentEmailAccount(primaryAccount || response.accounts[0]);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAccountChange = (account: EmailAccount) => {
    setCurrentEmailAccount(account);
    // In a real app, you would update the user's active email context
    // This could involve updating localStorage, context, or making an API call
    localStorage.setItem('activeEmailAccount', account.id);
    console.log('Switched to email account:', account.email);
    toast.success(`${account.email} hesabına geçildi`);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">E-posta hesapları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Email Header with Account Switcher */}
      <EmailHeader
        currentUser={currentUser}
        currentEmailAccount={currentEmailAccount || undefined}
        onEmailAccountChange={handleEmailAccountChange}
        packageLimit={companyInfo.maxEmailAccounts}
        usedAccounts={emailAccounts.length}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentEmailAccount ? (
          <WebmailInterface
            currentUser={currentUser}
            currentEmailAccount={currentEmailAccount}
            onAccountChange={handleEmailAccountChange}
            companyPlan={companyInfo.plan}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">E-posta hesabı bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                E-posta okumak için önce bir e-posta hesabı oluşturun.
              </p>
              <Button onClick={() => window.location.href = '/email/create'}>
                E-posta Hesabı Oluştur
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}