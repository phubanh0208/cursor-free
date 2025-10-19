'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Loader } from 'lucide-react';
import { UserProvider, useUser } from '@/contexts/UserContext';

function CustomerLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={user.role} username={user.username} credits={user.credits} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <CustomerLayoutContent>{children}</CustomerLayoutContent>
    </UserProvider>
  );
}
