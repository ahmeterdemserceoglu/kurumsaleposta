'use client'

import { useEffect } from 'react'

declare global {
    interface Window {
        $crisp?: any
        CRISP_WEBSITE_ID?: string
    }
}

export default function CrispChat() {
    useEffect(() => {
        // Crisp Website ID - Kendi ID'nizi buraya ekleyin
        window.CRISP_WEBSITE_ID = "0ca318d9-c91f-4eeb-b772-0afef877a4ce"

        // Crisp chat widget'ını yükle
        const script = document.createElement('script')
        script.src = 'https://client.crisp.chat/l.js'
        script.async = true

        // Script'i head'e ekle
        document.head.appendChild(script)

        // Crisp konfigürasyonu
        script.onload = () => {
            if (window.$crisp) {
                // Türkçe dil desteği
                window.$crisp.push(['set', 'session:data', {
                    locale: 'tr'
                }])

                // Gelişmiş Tasarım Özelleştirmeleri
                window.$crisp.push(['set', 'chat:color:primary', '#2563eb']) // Modern mavi
                window.$crisp.push(['set', 'chat:color:background', '#ffffff']) // Beyaz arka plan
                window.$crisp.push(['set', 'chat:color:text', '#1f2937']) // Koyu gri metin
                
                // Chat başlığı ve açıklama
                window.$crisp.push(['set', 'chat:title', '💬 İnf İletişim Destek'])
                window.$crisp.push(['set', 'chat:subtitle', 'E-posta uzmanlarımız size yardımcı olmaya hazır'])
                
                // Avatar ve marka özelleştirmeleri
                window.$crisp.push(['set', 'user:company', 'İnf İletişim'])
                window.$crisp.push(['set', 'user:avatar', 'https://ui-avatars.com/api/?name=İnf+İletişim&background=2563eb&color=ffffff&size=128'])
                
                // Operatör bilgileri
                window.$crisp.push(['set', 'session:segments', [['website-visitor', 'email-hosting']]])
                
                // Gelişmiş hoş geldin mesajları
                setTimeout(() => {
                    window.$crisp.push(['do', 'message:send', [
                        'text',
                        '👋 Merhaba! İnf İletişim\'e hoş geldiniz.\n\n📧 E-posta barındırma hizmetlerimiz hakkında bilgi almak veya teknik destek için buradayım.\n\n❓ Size nasıl yardımcı olabilirim?'
                    ]])
                }, 2000)

                // Hızlı yanıt butonları
                setTimeout(() => {
                    window.$crisp.push(['do', 'message:send', [
                        'picker',
                        {
                            id: 'quick_options',
                            text: 'Hangi konuda yardım istiyorsunuz?',
                            choices: [
                                {
                                    value: 'pricing',
                                    label: '💰 Fiyatlandırma',
                                    selected: false
                                },
                                {
                                    value: 'technical',
                                    label: '🔧 Teknik Destek',
                                    selected: false
                                },
                                {
                                    value: 'setup',
                                    label: '⚙️ Kurulum Yardımı',
                                    selected: false
                                },
                                {
                                    value: 'migration',
                                    label: '📤 E-posta Taşıma',
                                    selected: false
                                },
                                {
                                    value: 'other',
                                    label: '💬 Diğer',
                                    selected: false
                                }
                            ]
                        }
                    ]])
                }, 4000)

                // Chat açıldığında özel mesaj
                window.$crisp.push(['on', 'chat:opened', function() {
                    console.log('Chat açıldı - İnf İletişim Destek')
                }])

                // Mesaj gönderildiğinde tracking
                window.$crisp.push(['on', 'message:sent', function() {
                    console.log('Kullanıcı mesaj gönderdi')
                }])

                // Çevrimdışı durumda özel mesaj
                window.$crisp.push(['set', 'chat:offline:text', 
                    '🕐 Şu anda çevrimdışıyız\n\nMesajınızı bırakın, en kısa sürede size dönüş yapalım.\n\n📧 Acil durumlar için: destek@infiletisim.com'
                ])

                // Chat pozisyonu (sağ alt)
                window.$crisp.push(['set', 'chat:position', 'right'])
                
                // Animasyon efektleri
                window.$crisp.push(['set', 'chat:animation', 'fade'])
                
                // Ses bildirimleri
                window.$crisp.push(['set', 'chat:sound', true])
            }
        }

        // Custom CSS ekleme
        const customStyle = document.createElement('style')
        customStyle.textContent = `
            /* Crisp Chat Özelleştirmeleri */
            .crisp-client .cc-tlyw .cc-kxkl .cc-1hqb {
                border-radius: 16px !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            }
            
            .crisp-client .cc-tlyw .cc-kxkl .cc-1hqb .cc-1n5o {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
                border-radius: 16px 16px 0 0 !important;
            }
            
            .crisp-client .cc-tlyw .cc-kxkl .cc-1hqb .cc-1n5o .cc-unoo .cc-1vqo {
                color: white !important;
                font-weight: 600 !important;
            }
            
            .crisp-client .cc-tlyw .cc-kxkl .cc-1hqb .cc-1n5o .cc-unoo .cc-1tqo {
                color: rgba(255, 255, 255, 0.8) !important;
            }
            
            /* Chat balonu */
            .crisp-client .cc-tlyw .cc-kxkl .cc-1hqb .cc-1sq9 .cc-1duq .cc-xbqo {
                border-radius: 12px !important;
                margin: 8px 0 !important;
            }
            
            /* Gönder butonu */
            .crisp-client .cc-tlyw .cc-kxkl .cc-1hqb .cc-1w2o .cc-1x2o .cc-1y2o {
                background: #2563eb !important;
                border-radius: 8px !important;
            }
            
            /* Chat açma butonu */
            .crisp-client .cc-tlyw .cc-unoo .cc-1hqb {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
                border-radius: 50% !important;
                box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            
            .crisp-client .cc-tlyw .cc-unoo .cc-1hqb:hover {
                transform: scale(1.05) !important;
                box-shadow: 0 15px 20px -3px rgba(37, 99, 235, 0.4) !important;
            }
            
            /* Typing indicator */
            .crisp-client .cc-tlyw .cc-kxkl .cc-1hqb .cc-1sq9 .cc-1duq .cc-xbqo.cc-1zbq {
                background: #f3f4f6 !important;
                border: 1px solid #e5e7eb !important;
            }
        `
        document.head.appendChild(customStyle)

        // Cleanup function
        return () => {
            // Script'i kaldır
            const existingScript = document.querySelector('script[src*="client.crisp.chat"]')
            if (existingScript) {
                existingScript.remove()
            }

            // Custom style'ı kaldır
            if (customStyle && customStyle.parentNode) {
                customStyle.parentNode.removeChild(customStyle)
            }

            // Crisp widget'ını kaldır
            const crispWidget = document.querySelector('#crisp-chatbox')
            if (crispWidget) {
                crispWidget.remove()
            }

            // Global değişkenleri temizle
            if (window.$crisp) {
                delete window.$crisp
            }
            if (window.CRISP_WEBSITE_ID) {
                delete window.CRISP_WEBSITE_ID
            }
        }
    }, [])

    return null
}