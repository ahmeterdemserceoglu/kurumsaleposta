'use client';

import { useState, useEffect } from 'react';
import { EmailAccount, User } from '@/types';
import { EmailAPIService } from '@/lib/services/email.service';
import { EmailAccountList } from './EmailAccountList';
import { EmailAccountCreateForm } from './EmailAccountCreateForm';
import { BulkEmailAccountForm } from './BulkEmailAccountForm';
import { EmailForwardingDialog } from './EmailForwardingDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, Settings, Trash2, Forward } from 'lucide-react';
import { toast } from 'sonner';

interface EmailAccountManagementProps {
  companyId: string;
  currentUser: User;
  packageInfo?: {
    plan: string;
    maxEmailAccounts: number;
  };
}

export function EmailAccountManagement({ companyId, currentUser, packageInfo }: EmailAccountManagementProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDialog, setBulkDialog] = useState(false);
  const [showForwardingDialog, setShowForwardingDialog] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Load email accounts
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await EmailAPIService.getEmailAccounts(companyId, {
        page: pagination.page,
        limit: pagination.limit
      });

      setAccounts(response.accounts);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit)
      }));
    } catch (error) {
      console.error('Error loading email accounts:', error);
      toast.error('Failed to load email accounts');
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts based on search and status
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchQuery === '' ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || statusFilter === 'all' || account.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle account creation
  const handleAccountCreated = (newAccount: EmailAccount) => {
    setAccounts(prev => [newAccount, ...prev]);
    setShowCreateDialog(false);
    toast.success('Email account created successfully');
  };

  // Handle bulk account creation
  const handleBulkAccountsCreated = (newAccounts: EmailAccount[]) => {
    setAccounts(prev => [...newAccounts, ...prev]);
    setBulkDialog(false);
    toast.success(`${newAccounts.length} email accounts created successfully`);
  };

  // Handle account deletion
  const handleDeleteAccount = async (accountId: string, retainData: boolean = true) => {
    try {
      await EmailAPIService.deleteEmailAccount(accountId);

      if (retainData) {
        // Update account status to inactive
        setAccounts(prev =>
          prev.map(account =>
            account.id === accountId
              ? { ...account, status: 'inactive' as const }
              : account
          )
        );
        toast.success('Email account deactivated, data retained');
      } else {
        // Remove account from list
        setAccounts(prev => prev.filter(account => account.id !== accountId));
        toast.success('Email account deleted permanently');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete email account');
    }
  };

  // Handle forwarding configuration
  const handleConfigureForwarding = (account: EmailAccount) => {
    setSelectedAccount(account);
    setShowForwardingDialog(true);
  };

  useEffect(() => {
    loadAccounts();
  }, [companyId, pagination.page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Account Management</h1>
          <p className="text-muted-foreground">
            Manage email accounts for your organization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Email Account</DialogTitle>
              </DialogHeader>
              <EmailAccountCreateForm
                companyId={companyId}
                onAccountCreated={handleAccountCreated}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showBulkDialog} onOpenChange={setBulkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Bulk Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Create Email Accounts</DialogTitle>
              </DialogHeader>
              <BulkEmailAccountForm
                companyId={companyId}
                onAccountsCreated={handleBulkAccountsCreated}
                onCancel={() => setBulkDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paket Tipi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {packageInfo?.plan?.toUpperCase() || 'STARTER'}
            </div>
            <p className="text-xs text-muted-foreground">
              {packageInfo?.maxEmailAccounts || 10} hesap limiti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kullanılan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${pagination.total >= (packageInfo?.maxEmailAccounts || 10) * 0.8 ? 'bg-red-500' :
                    pagination.total >= (packageInfo?.maxEmailAccounts || 10) * 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${Math.min((pagination.total / (packageInfo?.maxEmailAccounts || 10)) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round((pagination.total / (packageInfo?.maxEmailAccounts || 10)) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Hesaplar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {accounts.filter(a => a.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Çalışır durumda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif Hesaplar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {accounts.filter(a => a.status === 'inactive').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Devre dışı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Depolama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(accounts.reduce((sum, a) => sum + a.storageUsed, 0) / 1024)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              Kullanılan alan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find and filter email accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Account List */}
      <EmailAccountList
        accounts={filteredAccounts}
        loading={loading}
        onDeleteAccount={handleDeleteAccount}
        onConfigureForwarding={handleConfigureForwarding}
        currentUser={currentUser}
      />

      {/* Forwarding Dialog */}
      {selectedAccount && (
        <EmailForwardingDialog
          account={selectedAccount}
          open={showForwardingDialog}
          onOpenChange={setShowForwardingDialog}
        />
      )}
    </div>
  );
}