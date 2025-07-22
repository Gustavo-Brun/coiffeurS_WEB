'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const [date, setDate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  const pathname = usePathname();

  const treatedPathname = pathname.replace('/', '').charAt(0).toUpperCase() + pathname.slice(2);

  useEffect(() => {
    setIsClient(true);
    setDate(new Date());

    var timer = setInterval(() => setDate(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium md:text-lg">{treatedPathname}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            size="sm"
          >
            {isClient ? (
              <p className="text-sm md:text-lg">{date?.toLocaleString('pt-BR')}</p>
            ) : (
              <p className="text-sm md:text-lg">Loading date...</p>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
