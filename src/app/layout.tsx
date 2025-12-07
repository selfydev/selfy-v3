import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Selfy v3',
  description: 'Modern web application built with Next.js 15',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
