'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailAccount } from '@/types';
import { EmailAPIService } from '@/lib/services/email.service';
import { bulkEmailAccountSchema, BulkEmailAccountFormData } from '@/lib/validations';

interface BulkCreateResponse {
  created: EmailAccount[];
  errors: Array<{ userId: string; error: string }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, Users, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BulkEmailAccountFormProps {
  companyId: string;
  onAccountsCreated: (accounts: EmailAccount[]) => void;
  onCancel: () => void;
}

export function BulkEmailAccountForm({
  companyId,
  onAccountsCreated,
  onCancel
}: BulkEmailAccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [showCsvInput, setShowCsvInput] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<BulkEmailAccountFormData>({
    resolver: zodResolver(bulkEmailAccountSchema),
    defaultValues: {
      accounts: [
        { firstName: '', lastName: '', userId: 'user_123' },
        { firstName: '', lastName: '', userId: 'user_124' },
        { firstName: '', lastName: '', userId: 'user_125' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'accounts'
  });

  const onSubmit = async (data: BulkEmailAccountFormData) => {
    try {
      setLoading(true);
      
      const response = await EmailAPIService.createBulkEmailAccounts(data.accounts) as unknown as BulkCreateResponse;
      
      // Check if response has error structure (partial success)
      if (response.errors && response.errors.length > 0) {
        // Show partial success message
        toast.success(
          `${response.created.length} accounts created successfully. ${response.errors.length} failed.`
        );
        
        // Show error details
        response.errors.forEach((error) => {
          toast.error(`Failed to create account for user ${error.userId}: ${error.error}`);
        });
        
        onAccountsCreated(response.created);
      } else {
        // All accounts created successfully
        toast.success(`${response.created.length} email accounts created successfully`);
        onAccountsCreated(response.created);
      }
      
      reset();
      
    } catch (error: any) {
      console.error('Error creating bulk email accounts:', error);
      toast.error('Failed to create email accounts');
    } finally {
      setLoading(false);
    }
  };

  const addAccount = () => {
    append({ firstName: '', lastName: '', userId: `user_${Date.now()}` });
  };

  const removeAccount = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleCsvImport = () => {
    try {
      const lines = csvData.trim().split('\n');
      const accounts = lines.map((line, index) => {
        const [firstName, lastName] = line.split(',').map(s => s.trim());
        
        if (!firstName || !lastName) {
          throw new Error(`Invalid data on line ${index + 1}`);
        }
        
        return {
          firstName,
          lastName,
          userId: `user_${Date.now()}_${index}`
        };
      });

      setValue('accounts', accounts);
      setCsvData('');
      setShowCsvInput(false);
      toast.success(`Imported ${accounts.length} accounts from CSV`);
      
    } catch (error: any) {
      toast.error(`CSV import failed: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Create Email Accounts
        </CardTitle>
        <CardDescription>
          Create multiple email accounts at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CSV Import Option */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Import Options</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCsvInput(!showCsvInput)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import from CSV
              </Button>
            </div>

            {showCsvInput && (
              <div className="space-y-2">
                <Label htmlFor="csvData">CSV Data (FirstName, LastName per line)</Label>
                <textarea
                  id="csvData"
                  className="w-full h-32 p-3 border rounded-md resize-none"
                  placeholder="John, Doe&#10;Jane, Smith&#10;Bob, Johnson"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCsvImport}
                    disabled={!csvData.trim()}
                  >
                    Import CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCsvData('');
                      setShowCsvInput(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Account Details</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAccount}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>

            {/* Account Fields */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Account {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`accounts.${index}.firstName`}>First Name</Label>
                      <Input
                        {...register(`accounts.${index}.firstName`)}
                        placeholder="First name"
                        disabled={loading}
                      />
                      {errors.accounts?.[index]?.firstName && (
                        <p className="text-xs text-red-600">
                          {errors.accounts[index]?.firstName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`accounts.${index}.lastName`}>Last Name</Label>
                      <Input
                        {...register(`accounts.${index}.lastName`)}
                        placeholder="Last name"
                        disabled={loading}
                      />
                      {errors.accounts?.[index]?.lastName && (
                        <p className="text-xs text-red-600">
                          {errors.accounts[index]?.lastName?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hidden User ID field */}
                  <Input
                    type="hidden"
                    {...register(`accounts.${index}.userId`)}
                  />

                  {/* Email Preview */}
                  {field.firstName && field.lastName && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Email: {field.firstName.toLowerCase()}.{field.lastName.toLowerCase()}@company.com
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>

            {/* Form Errors */}
            {errors.accounts && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors above before submitting.
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create {fields.length} Accounts
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}