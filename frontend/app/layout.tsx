import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryClientProviderWrapper } from '../providers/query-client-provider';
import MSWProvider from '../components/MSWProvider';
import AuthProvider from '../providers/auth-provider';
import AIProvider from './ai-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Market - Marketplace for AI Products',
  description: 'Discover and purchase cutting-edge AI products and services',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryClientProviderWrapper>
          <MSWProvider>
            <AuthProvider>
              <AIProvider>
                {children}
              </AIProvider>
            </AuthProvider>
          </MSWProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
