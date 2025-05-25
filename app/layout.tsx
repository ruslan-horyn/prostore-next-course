import { Toaster } from '@/components/ui/sonner';
import { envs } from '@/lib/constants';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import './globals.css';

const { APP_NAME, APP_DESCRIPTION, SERVER_URL } = envs;

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: `%s | Prostore`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem={false}
          themes={['dark', 'light']}
        >
          {children}
          <Toaster
            visibleToasts={3}
            swipeDirections={['right', 'left']}
            duration={5000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
