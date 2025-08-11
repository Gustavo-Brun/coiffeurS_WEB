'use client';

import { ComponentPropsWithoutRef } from 'react';

import { type Icon } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { toast } from 'react-toastify';
import { getCookies } from '@/services/sessionManager';

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string | 'copy';
    icon: Icon;
  }[];
} & ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const handleCopy = async () => {
    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.API_URL}/providers`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.data}`
        }
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage) {
        return toast.error(responseParsed.errorMessage);
      }

      if (response.status === 200) {
        navigator.clipboard.writeText(
          `${process.env.BASE_URL}/fila/${responseParsed.data.whatsappNumber}`
        );
        toast.success('Link copiado para a área de transferência.');

        return;
      }
    } catch (error) {
      console.log('ERROR', error);
      toast.error(
        `Ocorreu um erro ao tentar copiar o link para a área de transferência. Por favor, envie o link manualmente para o cliente no seguinte formato: ${process.env.BASE_URL}/fila/{seu-whatsapp}).`
      );
    }
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url === 'copy' ? (
                <SidebarMenuButton onClick={handleCopy}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <a
                  target="_blank"
                  href={item.url}
                >
                  <SidebarMenuButton>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </a>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
