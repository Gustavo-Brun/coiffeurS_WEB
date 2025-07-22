import { SideBar } from '@/app/(main)/@components/sidebar';
import { ChartAreaInteractive } from '@/app/(main)/dashboard/components/ChartAreaInteractive';
import { DataTable } from '@/app/(main)/dashboard/components/DataTable';
import { SectionCards } from '@/app/(main)/dashboard/components/SectionCards';
import { Header } from '@/app/(main)/@components/sidebar/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React from 'react';
import dynamic from 'next/dynamic';
import Alert from '@/components/ui/alert';

export default function DailyVetMainLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <SideBar variant="inset" />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
