import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";
import { APP_NAME } from "@/lib/constants";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | Prostore`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["dark", "light"]}
        >
          {children}
          <Toaster visibleToasts={3} swipeDirections={["right", "left"]} />
        </ThemeProvider>
      </body>
    </html>
  );
}
