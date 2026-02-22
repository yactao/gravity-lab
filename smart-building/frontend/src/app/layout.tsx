import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TenantProvider } from "@/lib/TenantContext";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartBuild - Dashboard GTB",
  description: "Plateforme de gestion technique du bâtiment next-gen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TenantProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 ml-64 relative">
                <Header />
                <div className="pt-24 px-8 pb-8">
                  {children}
                </div>
              </main>
            </div>
          </TenantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
