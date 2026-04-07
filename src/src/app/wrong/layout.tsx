'use client';

import { Sidebar } from '@/components/Layout';

export default function WrongLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
