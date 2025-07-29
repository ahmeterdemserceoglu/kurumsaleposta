'use client';

import { useState } from 'react';
import { EmailAccount, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Forward, Trash2, Settings, Mail } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface EmailAccountListProps {
  accounts: EmailAccount[];
  loading: boolean;
  onDeleteAccount: (accountId: string, retainData: boolean) => void;
  onConfigureForwarding: (account: EmailAccount) => void;
  currentUser: User;
}

export function EmailAccountList({
  accounts,
  loading,
  onDeleteAccount,
  onConfigureForwarding,
  currentUser
}: EmailAccountListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    account: EmailAccount | null;
    retainData: boolean;
  }>({
    open: false,
    account: null,
    retainData: true
  });

  const handleDeleteClick = (account: EmailAccount, retainData: boolean) => {
    setDeleteDialog({
      open: true,
      account,
      retainData
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.account) {
      onDeleteAccount(deleteDialog.account.id, deleteDialog.retainData);
      setDeleteDialog({ open: false, account: null, retainData: true });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No email accounts found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first email account.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Email Accounts ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Storage Used</TableHead>
                <TableHead>Forwarding Rules</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.email}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={account.status === 'active' ? 'default' : 'secondary'}
                    >
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatBytes(account.storageUsed)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{account.forwardingRules.length} rules</span>
                      {account.forwardingRules.some(rule => rule.isActive) && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onConfigureForwarding(account)}
                        >
                          <Forward className="mr-2 h-4 w-4" />
                          Configure Forwarding
                        </DropdownMenuItem>
                        
                        {currentUser.role === 'admin' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(account, true)}
                              className="text-orange-600"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Deactivate (Retain Data)
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(account, false)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.retainData ? 'Deactivate Email Account' : 'Delete Email Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.retainData ? (
                <>
                  Are you sure you want to deactivate the email account{' '}
                  <strong>{deleteDialog.account?.email}</strong>? The account will be 
                  disabled but all data will be retained and can be reactivated later.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete the email account{' '}
                  <strong>{deleteDialog.account?.email}</strong>? This action cannot be 
                  undone and all associated data will be lost.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className={deleteDialog.retainData ? '' : 'bg-red-600 hover:bg-red-700'}
            >
              {deleteDialog.retainData ? 'Deactivate' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}