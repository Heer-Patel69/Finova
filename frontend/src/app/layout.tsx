import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'Finova | AI Financial Operating System for Students',
  description: 'Track transactions, make smarter financial decisions, and save more with AI-powered coaching and gamified habits. Built for students.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#6C5CE7" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-full flex flex-col font-body">
        <ThemeProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
