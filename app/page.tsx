'use client'
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle } from "lucide-react";
import { useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { User } from '@/types'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a token
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setIsLoading(false)
          return
        }

        // Get current user from storage
        const currentUser = AuthService.getCurrentUser()
        if (!currentUser) {
          setIsLoading(false)
          return
        }

        // Check if authenticated (this might refresh token if needed)
        const isAuthenticated = AuthService.isAuthenticated()

        if (isAuthenticated) {
          setUser(currentUser)
        } else {
          // Try to refresh token
          try {
            await AuthService.refreshToken()
            const refreshedUser = AuthService.getCurrentUser()
            if (refreshedUser) {
              setUser(refreshedUser)
            }
          } catch (error) {
            // Refresh failed, clear everything
            AuthService.logout()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">

            <span className="font-semibold text-lg">İnf İletişim</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Özellikler</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">Fiyatlandırma</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">İletişim</a>
          </nav>
          <div className="flex items-center space-x-4">
            {!isLoading && (
              user ? (
                // Authenticated user
                <>
                  <span className="text-muted-foreground">
                    Hoş geldin, {user.firstName}
                  </span>
                  <a
                    href="/email"
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    Panelim
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                // Non-authenticated user
                <>
                  <a href="/login" className="text-muted-foreground hover:text-foreground">Giriş Yap</a>
                  <a href="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                    Başlayın
                  </a>
                </>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Profesyonel E-posta Barındırma
            <br />
            <span className="text-foreground/80">İşletmeniz İçin</span>
          </h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Kendi domain adınızı kullanarak profesyonel e-posta adresleri oluşturun ve yönetin.
            Her büyüklükteki işletme için güvenli, güvenilir ve özellik açısından zengin e-posta barındırma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="bg-primary text-primary-foreground px-8 py-3 rounded-md text-lg hover:bg-primary/90">
              Ücretsiz Deneme Başlat
            </a>
            <a href="#features" className="border border-border px-8 py-3 rounded-md text-lg hover:bg-muted">
              Daha Fazla Bilgi
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Neden E-posta Barındırma Hizmetimizi Seçmelisiniz?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Güvenli ve Güvenilir</h3>
              <p className="text-muted-foreground">
                %99.9 çalışma süresi garantisi ve gelişmiş spam koruması ile kurumsal düzeyde güvenlik.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kolay Yönetim</h3>
              <p className="text-muted-foreground">
                Şirketinizin tüm e-posta hesaplarını tek yerden yönetmek için sezgisel yönetici paneli.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobil Uyumlu</h3>
              <p className="text-muted-foreground">
                Duyarlı web istemcimiz ve mobil uygulamalarımız ile e-postanıza her yerden erişin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Basit, Şeffaf Fiyatlandırma</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border border-border rounded-lg p-6 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">Başlangıç</h3>
                <div className="text-3xl font-bold mb-4">₺99<span className="text-lg text-muted-foreground">/ay</span></div>
                <p className="text-muted-foreground text-sm mb-4">Küçük ekipler için ideal</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 10 e-posta hesabı</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 5 GB depolama/hesap</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Temel güvenlik</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> E-posta desteği</li>
                </ul>
              </div>
              <a href="/register?plan=starter" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 block text-center mt-auto">
                Başlayın
              </a>
            </div>
            <div className="border border-primary rounded-lg p-6 relative flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                Popüler
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">İş</h3>
                <div className="text-3xl font-bold mb-4">₺299<span className="text-lg text-muted-foreground">/ay</span></div>
                <p className="text-muted-foreground text-sm mb-4">Büyüyen şirketler için</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 50 e-posta hesabı</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 25 GB depolama/hesap</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Gelişmiş güvenlik</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Öncelikli destek</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Yedekleme servisi</li>
                </ul>
              </div>
              <a href="/register?plan=business" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 block text-center mt-auto">
                Başlayın
              </a>
            </div>
            <div className="border border-border rounded-lg p-6 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">Kurumsal</h3>
                <div className="text-3xl font-bold mb-4">₺799<span className="text-lg text-muted-foreground">/ay</span></div>
                <p className="text-muted-foreground text-sm mb-4">Büyük organizasyonlar için</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 200 e-posta hesabı</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 100 GB depolama/hesap</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Kurumsal güvenlik</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 7/24 telefon desteği</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Özel yedekleme</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> API erişimi</li>
                </ul>
              </div>
              <a href="/register?plan=enterprise" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 block text-center mt-auto">
                Başlayın
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Geliştirilmiş Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Ana İçerik */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

            {/* Şirket Bilgileri */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-xl">İnf İletişim</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Kurumsal işletmeler için güvenli, hızlı ve profesyonel e-posta barındırma çözümleri sunuyoruz.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/infiletisim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/infiletisim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/company/infiletisim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/infiletisim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@infiletisim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-red-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>

              {/* WhatsApp Butonu */}
              <a
                href="https://wa.me/905321234567?text=Merhaba,%20İnf%20İletişim%20hizmetleri%20hakkında%20bilgi%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Destek</span>
              </a>
            </div>

            {/* Hizmetlerimiz */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white">Hizmetlerimiz</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/services/corporate-email" className="text-slate-300 hover:text-white transition-colors">Kurumsal E-posta</a></li>
                <li><a href="/services/domain-management" className="text-slate-300 hover:text-white transition-colors">Domain Yönetimi</a></li>
                <li><a href="/services/mail-security" className="text-slate-300 hover:text-white transition-colors">Mail Güvenliği</a></li>
                <li><a href="/services/backup" className="text-slate-300 hover:text-white transition-colors">Yedekleme Hizmetleri</a></li>
                <li><a href="/support" className="text-slate-300 hover:text-white transition-colors">Teknik Destek</a></li>
              </ul>
            </div>

            {/* İletişim Bilgileri */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white">İletişim</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">+90 (312) 123 45 67</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">info@infiletisim.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                  <div className="text-slate-300">
                    <div>Kızılay Mah. Atatürk Blv. No:123</div>
                    <div>Çankaya/Ankara</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">7/24 Destek</span>
                </div>

              </div>
            </div>

            {/* Yararlı Linkler */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white">Yararlı Linkler</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-slate-300 hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Paketler</a></li>
                <li><a href="/faq" className="text-slate-300 hover:text-white transition-colors">SSS</a></li>
                <li><a href="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/careers" className="text-slate-300 hover:text-white transition-colors">Kariyer</a></li>
              </ul>
            </div>
          </div>

          {/* Alt Çizgi */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
                <a href="/privacy" className="text-slate-400 hover:text-white transition-colors">Gizlilik Politikası</a>
                <a href="/terms" className="text-slate-400 hover:text-white transition-colors">Hizmet Şartları</a>
                <a href="/cookies" className="text-slate-400 hover:text-white transition-colors">Çerez Politikası</a>
                <a href="/kvkk" className="text-slate-400 hover:text-white transition-colors">KVKK</a>
              </div>
              <div className="text-slate-400 text-sm">
                © 2025 İnf İletişim. Tüm hakları saklıdır.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}