'use client';

import { EmailAccount, User } from '@/types';
import { EmailAccountSwitcher } from '@/components/email/EmailAccountSwitcher';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EmailHeaderProps {
  currentUser: User;
  currentEmailAccount?: EmailAccount;
  onEmailAccountChange: (account: EmailAccount) => void;
  packageLimit?: number;
  usedAccounts?: number;
}

export function EmailHeader({
  currentUser,
  currentEmailAccount,
  onEmailAccountChange,
  packageLimit = 10,
  usedAccounts = 0
}: EmailHeaderProps) {
  const router = useRouter();

  const handleCreateNewAccount = () => {
    if (usedAccounts >= packageLimit) {
      toast.error('Paket limitinize ulaştınız. Lütfen paketinizi yükseltin.');
      return;
    }
    router.push('/email/create');
  };

  const handleManageAccounts = () => {
    router.push('/email/manage');
  };

  return (
    <div className="border-b bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-center">
          <EmailAccountSwitcher
            currentUser={currentUser}
            currentEmailAccount={currentEmailAccount}
            onEmailAccountChange={onEmailAccountChange}
            onCreateNewAccount={handleCreateNewAccount}
            onManageAccounts={handleManageAccounts}
          />
        </div>
      </div>
    </div>
  );
}