'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import Navbar from '@/components/Navbar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      <main>{children}</main>
    </AuthProvider>
  );
} 