import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 wrapper">{children}</main>
    </div>
  );
}
