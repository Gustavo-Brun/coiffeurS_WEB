'use client';

import { ComponentProps } from 'react';

import {
  IconDashboard,
  IconHelp,
  IconListDetails,
  IconSettings,
  IconBrandWhatsapp,
  IconUsers,
  IconCopy
} from '@tabler/icons-react';

import { NavPrimary } from '@/app/(main)/@components/sidebar/NavPrimary';
import { NavSecondary } from '@/app/(main)/@components/sidebar/NavSecondary';
import { NavUser } from '@/app/(main)/@components/sidebar/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import Image from 'next/image';

const data = {
  // user: {
  //   name: 'shadcn',
  //   email: 'm@example.com',
  //   avatar: '/avatars/shadcn.jpg'
  // },
  NavPrimary: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard
    },
    {
      title: 'Agenda',
      url: '/agenda',
      icon: IconListDetails
    },
    {
      title: 'Clientes',
      url: '/clientes',
      icon: IconUsers
    }
    // {
    //   title: 'WhatsApp',
    //   url: '/whatsapp',
    //   icon: IconBrandWhatsapp
    // },
  ],
  navSecondary: [
    {
      title: 'Fila Pública',
      url: 'copy',
      icon: IconCopy
    },
    {
      title: 'Suporte',
      url: process.env.SUPPORT_LINK as string,
      icon: IconHelp
    }
    // {
    //   title: 'Configurações',
    //   url: '#',
    //   icon: IconSettings
    // }
  ]
};

export default function SideBar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-full w-full border-2 data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Image
                src={'/logo.png'}
                priority
                alt="logo"
                width={594}
                height={410}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPrimary items={data.NavPrimary} />
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
