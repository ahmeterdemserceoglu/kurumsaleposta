'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Mail, Plus, Search, MoreVertical, Edit, Trash2, Settings, Users, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { EmailAPIService } from '@/lib/services/email.service';
import { TokenManager } from '@/lib/auth';
import { EmailAccount, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ManageEmailAccountsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState<EmailAccount[]>([]);

  useEffect(() => {
    setIsClient(true);
    const user = TokenManager.getUser();
    setCurrentUser(user);
    
    if (!user) {
      router.push('/login');
    } else {
      loadEmailAccounts();
    }
  }, [router]);

  useEffect(() => {
    // Filter accounts based on search query
    const filtered = emailAccounts.filter(account =>
      account.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }, [emailAccounts, searchQuery]);

  const loadEmailAccounts = async () => {
    try {
      setLoading(true);
      const user = TokenManager.getUser();
      if (!user) return;

      const response = await EmailAPIService.getEmailAccounts(user.companyId);
      setEmailAccounts(response.accounts || []);
    } catch (error) {
      console.error('Error loading email accounts:', error);
      toast.error('E-posta hesapları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string, email: string) => {
    if (!confirm(`${email} hesabını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await EmailAPIService.deleteEmailAccount(accountId);
      toast.success('E-posta hesabı silindi');
      loadEmailAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Hesap silinirken hata oluştu');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Pasif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  // Loading state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // User not found state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h1 className="text-xl font-semibold">E-posta Hesapları</h1>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/email/create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Yeni Hesap
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Hesap</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailAccounts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Aktif hesap sayısı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Depolama</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatStorageSize(emailAccounts.reduce((total, account) => total + account.storageUsed, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kullanılan depolama alanı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paket Durumu</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Enterprise</div>
                <p className="text-xs text-muted-foreground">
                  Aktif paket planı
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>E-posta Hesapları</CardTitle>
              <CardDescription>
                Tüm e-posta hesaplarınızı görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="E-posta adresinde ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Accounts Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-posta Adresi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Depolama</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchQuery ? 'Arama kriterinize uygun hesap bulunamadı' : 'Henüz e-posta hesabı yok'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {account.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{account.email}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {account.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(account.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatStorageSize(account.storageUsed)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {account.createdAt ? formatDistanceToNow(new Date(account.createdAt), { 
                                addSuffix: true, 
                                locale: tr 
                              }) : 'Bilinmiyor'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/email?account=${account.id}`)}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  E-postaları Görüntüle
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Ayarlar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteAccount(account.id, account.email)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}