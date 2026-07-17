'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <AuthProvider>
      {!isAuthPage && <Sidebar />}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </AuthProvider>
  );
}
