'use client';

import { Sidebar } from '@/components/Layout';

export default function QuestionBankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Left Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
