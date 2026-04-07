'use client';

export default function InitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Init page uses full screen layout without sidebar
  return <>{children}</>;
}
