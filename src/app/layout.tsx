import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ron Rush',
  description: 'A fast Mahjong tile prediction game.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
