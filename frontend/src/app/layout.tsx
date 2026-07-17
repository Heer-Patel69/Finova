import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: 'Finova | AI Financial Operating System for Students',
  description: 'Track transactions, make smarter financial decisions, and save more with AI-powered coaching and friendly Neo-Brutalist gamification.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-finova-bg text-finova-black font-body">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
