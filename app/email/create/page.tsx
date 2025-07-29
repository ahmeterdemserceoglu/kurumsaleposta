'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Plus, AtSign, Building } from 'lucide-react';
import { toast } from 'sonner';
import { EmailAPIService } from '@/lib/services/email.service';
import { TokenManager } from '@/lib/auth';
import { User } from '@/types';

export default function CreateEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    domain: ''
  });

  useEffect(() => {
    setIsClient(true);
    const user = TokenManager.getUser();
    setCurrentUser(user);
    
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      router.push('/login');
      return;
    }
    
    if (!formData.username.trim()) {
      toast.error('Kullanıcı adı gereklidir');
      return;
    }

    if (!formData.domain.trim()) {
      toast.error('Domain gereklidir');
      return;
    }

    // Domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(formData.domain)) {
      toast.error('Geçerli bir domain girin (örn: sirketim.com)');
      return;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast.error('Kullanıcı adı sadece harf, rakam, nokta, tire ve alt çizgi içerebilir');
      return;
    }

    setLoading(true);
    
    try {
      const emailAddress = `${formData.username}@${formData.domain}`;
      
      const response = await EmailAPIService.createEmailAccount({
        email: emailAddress,
        userId: currentUser.id,
        companyId: currentUser.companyId
      });

      if (response.success) {
        toast.success('E-posta hesabı başarıyla oluşturuldu!');
        router.push('/email');
      } else {
        toast.error(response.message || 'E-posta hesabı oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating email account:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
              <Mail className="h-5 w-5" />
              <h1 className="text-xl font-semibold">Yeni E-posta Hesabı</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                E-posta Hesabı Oluştur
              </CardTitle>
              <CardDescription>
                Ana hesabınız ({currentUser.email}) altında yeni bir e-posta hesabı oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="satis, destek, info, admin..."
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                      required
                      className="pr-10"
                    />
                    <AtSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sadece harf, rakam, nokta (.), tire (-) ve alt çizgi (_) kullanabilirsiniz
                  </p>
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <div className="relative">
                    <Input
                      id="domain"
                      type="text"
                      placeholder="sirketim.com, example.org, mydomain.net..."
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value.toLowerCase())}
                      required
                      className="pr-10"
                    />
                    <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Şirketinizin domain adını girin (örn: sirketim.com)
                  </p>
                </div>

                {/* Preview */}
                {formData.username && formData.domain && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Oluşturulacak E-posta:</Label>
                    <div className="text-lg font-mono mt-1">
                      {formData.username}@{formData.domain}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.username || !formData.domain}
                    className="flex-1"
                  >
                    {loading ? 'Oluşturuluyor...' : 'E-posta Hesabı Oluştur'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Nasıl Çalışır?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Ana Hesap Bağlantısı</p>
                  <p className="text-sm text-muted-foreground">
                    Oluşturulan e-posta hesabı ana hesabınız ({currentUser.email}) altında çalışır
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Tek Giriş</p>
                  <p className="text-sm text-muted-foreground">
                    Ana hesabınızla giriş yaparak tüm e-posta hesaplarınızı yönetebilirsiniz
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Özel Domain</p>
                  <p className="text-sm text-muted-foreground">
                    İstediğiniz domain adını kullanarak profesyonel e-posta adresleri oluşturun
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Örnek Kullanımlar</p>
                  <p className="text-sm text-muted-foreground">
                    satis@sirketim.com, destek@sirketim.com, info@sirketim.com, admin@sirketim.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}