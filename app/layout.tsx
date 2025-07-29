import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import CrispChat from "@/components/CrispChat";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "İnf İletişim - Profesyonel E-posta Çözümleri",
  description: "İnf İletişim ile işletmeler için profesyonel e-posta barındırma hizmetleri. Kendi domain adınızı kullanarak kapsamlı e-posta yönetim platformumuz ile e-posta adresleri oluşturun ve yönetin.",
  keywords: ["e-posta barındırma", "kurumsal e-posta", "işletme e-postası", "profesyonel e-posta", "domain e-posta", "İnf İletişim"],
  authors: [{ name: "İnf İletişim" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <CrispChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
