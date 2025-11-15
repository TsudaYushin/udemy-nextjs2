import type { Metadata } from 'next';
import PrivateHeader from '@/components/layouts/PrivateHeader';

export const metadata: Metadata = {
  title: 'ダッシュボード - My App',
  description: '認証済みユーザー向けページ',
};

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PrivateHeader />
      {children}
    </>
  );
}

