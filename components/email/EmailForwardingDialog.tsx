'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailAccount, ForwardingRule } from '@/types';
import { EmailAPIService } from '@/lib/services/email.service';
import { forwardingRuleSchema, ForwardingRuleFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, Forward, AlertCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface EmailForwardingDialogProps {
  account: EmailAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailForwardingDialog({
  account,
  open,
  onOpenChange
}: EmailForwardingDialogProps) {
  const [forwardingRules, setForwardingRules] = useState<ForwardingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(forwardingRuleSchema),
    defaultValues: {
      fromAddress: account.email,
      toAddress: '',
      isActive: true
    }
  });

  // Load forwarding rules when dialog opens
  useEffect(() => {
    if (open && account) {
      loadForwardingRules();
    }
  }, [open, account]);

  const loadForwardingRules = async () => {
    try {
      setLoading(true);
      const rules = await EmailAPIService.getForwardingRules(account.id);
      setForwardingRules(rules);
    } catch (error) {
      console.error('Error loading forwarding rules:', error);
      toast.error('Failed to load forwarding rules');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      
      const newRule = await EmailAPIService.createForwardingRule(account.id, {
        fromAddress: data.fromAddress,
        toAddress: data.toAddress
      });

      setForwardingRules(prev => [...prev, newRule]);
      reset({ fromAddress: account.email, toAddress: '', isActive: true });
      toast.success('Forwarding rule created successfully');
      
    } catch (error: any) {
      console.error('Error creating forwarding rule:', error);
      
      if (error.response?.status === 409) {
        toast.error('Forwarding rule already exists');
      } else {
        toast.error('Failed to create forwarding rule');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const updatedRule = await EmailAPIService.updateForwardingRule(
        account.id,
        ruleId,
        { isActive }
      );

      setForwardingRules(prev =>
        prev.map(rule =>
          rule.id === ruleId ? updatedRule : rule
        )
      );

      toast.success(`Forwarding rule ${isActive ? 'enabled' : 'disabled'}`);
      
    } catch (error) {
      console.error('Error updating forwarding rule:', error);
      toast.error('Failed to update forwarding rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      await EmailAPIService.deleteForwardingRule(account.id, ruleId);
      
      setForwardingRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast.success('Forwarding rule deleted');
      
    } catch (error) {
      console.error('Error deleting forwarding rule:', error);
      toast.error('Failed to delete forwarding rule');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-5 w-5" />
            Email Forwarding Configuration
          </DialogTitle>
          <DialogDescription>
            Configure email forwarding rules for {account.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{account.email}</span>
                </div>
                <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                  {account.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Existing Forwarding Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Forwarding Rules</CardTitle>
              <CardDescription>
                Manage existing email forwarding rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : forwardingRules.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Forward className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No forwarding rules configured</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {forwardingRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{rule.fromAddress}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{rule.toAddress}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Add New Forwarding Rule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add New Forwarding Rule</CardTitle>
              <CardDescription>
                Create a new email forwarding rule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* From Address */}
                <div className="space-y-2">
                  <Label htmlFor="fromAddress">From Address</Label>
                  <Input
                    id="fromAddress"
                    {...register('fromAddress')}
                    disabled
                    className="bg-muted"
                  />
                  {errors.fromAddress && (
                    <p className="text-sm text-red-600">{errors.fromAddress.message}</p>
                  )}
                </div>

                {/* To Address */}
                <div className="space-y-2">
                  <Label htmlFor="toAddress">Forward To Address</Label>
                  <Input
                    id="toAddress"
                    {...register('toAddress')}
                    placeholder="Enter destination email address"
                    disabled={submitting}
                  />
                  {errors.toAddress && (
                    <p className="text-sm text-red-600">{errors.toAddress.message}</p>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    {...register('isActive')}
                    defaultChecked={true}
                  />
                  <Label htmlFor="isActive">Enable rule immediately</Label>
                </div>

                {/* Info Alert */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Forwarded emails will be sent to the destination address while keeping 
                    a copy in the original mailbox.
                  </AlertDescription>
                </Alert>

                {/* Form Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}