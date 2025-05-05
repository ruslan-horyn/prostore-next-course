import { Footer } from "@/components/footer";
import { Header } from "@/components/shared/header";
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 wrapper">{children}</main>
      <Footer />
    </div>
  );
}
