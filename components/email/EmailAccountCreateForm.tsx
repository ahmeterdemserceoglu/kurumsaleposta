'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailAccount, User } from '@/types';
import { EmailAPIService } from '@/lib/services/email.service';
import { emailAccountCreateSchema, EmailAccountCreateFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface EmailAccountCreateFormProps {
  companyId: string;
  onAccountCreated: (account: EmailAccount) => void;
  onCancel: () => void;
}

export function EmailAccountCreateForm({
  companyId,
  onAccountCreated,
  onCancel
}: EmailAccountCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const [previewEmail, setPreviewEmail] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [companyDomain, setCompanyDomain] = useState('sirketiniz.com');
  const [selectedUserId, setSelectedUserId] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<EmailAccountCreateFormData>({
    resolver: zodResolver(emailAccountCreateSchema)
  });

  // Watch form fields to generate email preview
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  // Load company domain and available users
  useEffect(() => {
    loadCompanyData();
    loadAvailableUsers();
  }, [companyId]);

  // Update email preview when names change
  React.useEffect(() => {
    if (firstName && lastName && companyDomain) {
      setPreviewEmail(`${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}`);
    } else {
      setPreviewEmail('');
    }
  }, [firstName, lastName, companyDomain]);

  const loadCompanyData = async () => {
    try {
      // Get company info from API
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const company = await response.json();
        setCompanyDomain(company.domain);
      } else {
        // Fallback
        setCompanyDomain('sirketiniz.com');
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      setCompanyDomain('sirketiniz.com');
    }
  };

  const loadAvailableUsers = async () => {
    try {
      // Get users without email accounts from API
      const response = await fetch(`/api/users?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users);
      } else {
        console.error('Failed to load users');
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setAvailableUsers([]);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setValue('userId', userId);
    
    // Auto-fill names from selected user
    const selectedUser = availableUsers.find(u => u.id === userId);
    if (selectedUser) {
      setValue('firstName', selectedUser.firstName);
      setValue('lastName', selectedUser.lastName);
    }
  };

  const onSubmit = async (data: EmailAccountCreateFormData) => {
    try {
      setLoading(true);
      
      // Bu bileşen artık kullanılmıyor - yeni create sayfası kullanılıyor
      // Geçici olarak hata fırlatalım
      throw new Error('This form is deprecated. Use /email/create page instead.');
      
      // const newAccount = await EmailAPIService.createEmailAccount(data);
      // onAccountCreated(newAccount);
      reset();
      toast.success('Email account created successfully');
      
    } catch (error: any) {
      console.error('Error creating email account:', error);
      
      if (error.response?.status === 409) {
        toast.error('User already has an email account');
      } else if (error.response?.status === 404) {
        toast.error('User or company not found');
      } else {
        toast.error('Failed to create email account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Create Email Account
        </CardTitle>
        <CardDescription>
          Create a new email account with automatic email address generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="userSelect">Kullanıcı Seçin</Label>
            <Select onValueChange={handleUserSelect} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="E-posta hesabı oluşturulacak kullanıcıyı seçin" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>{user.firstName} {user.lastName}</span>
                      <span className="text-muted-foreground text-sm">({user.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedUserId && (
              <p className="text-sm text-muted-foreground">
                Önce bir kullanıcı seçin, isim alanları otomatik doldurulacak
              </p>
            )}
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Ad</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Ad giriniz"
              disabled={loading || !selectedUserId}
              className={!selectedUserId ? 'bg-gray-50' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Soyad</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Soyad giriniz"
              disabled={loading || !selectedUserId}
              className={!selectedUserId ? 'bg-gray-50' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* User ID (Hidden field) */}
          <Input
            type="hidden"
            {...register('userId')}
            value={selectedUserId}
          />

          {/* Email Preview */}
          {previewEmail && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Generated Email:</strong> {previewEmail}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}