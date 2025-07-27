'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { IconCirclePlusFilled, IconLoader2, type Icon } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getCookies } from '@/services/sessionManager';

type FormProps = {
  name: string;
  whatsappNumber: string;
  note?: string;
};

export function NavPrimary({
  items
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const [whatsappNumber, setWhatsappNumber] = useState<string | undefined>(undefined);
  const [whatsappConfirmation, setWhatsappConfirmation] = useState(false);
  const [addToQueueConfirmation, setAddToQueueConfirmation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const {
    unregister,
    register,
    formState: { errors },
    handleSubmit
  } = useForm<FormProps>();

  const onSubmitFx: SubmitHandler<FormProps> = async (data) => {
    if (!data.whatsappNumber && !whatsappConfirmation)
      return toast.error(
        'Por favor, confirme o contato do cliente ou marque a opção de continuar sem contato.'
      );

    setIsLoading(true);

    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.BASE_URL}/clients/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.data}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          whatsappNumber: data.whatsappNumber,
          addToQueue: addToQueueConfirmation,
          note: data.note
        })
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage) {
        setIsLoading(false);
        return toast.error(responseParsed.errorMessage);
      }

      if (response.status === 201) {
        toast.success('Cliente agendado com sucesso!');

        if (pathname === '/agenda') {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }

          return;
        }

        return router.push('/agenda');
      }
    } catch (error) {
      console.log('ERROR', error);
      toast.error(
        'Ocorreu um erro ao agendar o cliente. Se o erro persistir entre em contato com nosso suporte.'
      );
    }

    return setIsLoading(false);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-6">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog onOpenChange={() => setAddToQueueConfirmation(true)}>
              <DialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground h-fit min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span className="md:text-xl">Novo Cliente</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Cliente</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmitFx)}
                  className="my-4 flex flex-col items-center gap-4"
                >
                  <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="name">Nome do Cliente</Label>
                    <Input
                      type="text"
                      id="name"
                      {...register('name', { required: true })}
                    />
                    {errors.name?.type === 'required' && (
                      <p
                        role="alert"
                        className="text-xs text-red-500"
                      >
                        O nome do cliente é obrigatório.
                      </p>
                    )}
                  </div>

                  <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="contact">WhatsApp</Label>
                    <Input
                      type="text"
                      id="contact"
                      placeholder="ex: 11999999999"
                      onChange={(e) => {
                        unregister('whatsappNumber');
                        register('whatsappNumber', { value: e.target.value });
                        setWhatsappNumber(e.target.value);
                      }}
                    />
                    {!whatsappNumber && (
                      <>
                        {!whatsappConfirmation && (
                          <p
                            role="alert"
                            className="text-xs text-red-500"
                          >
                            Sem esta informação não será possível utilizar todos os recursos do
                            sistema. Tem certeza que deseja continuar?
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Checkbox
                            id="contactConfirmation"
                            onCheckedChange={(checked) =>
                              setWhatsappConfirmation(checked ? true : false)
                            }
                          />
                          <Label htmlFor="contactConfirmation">Quero continuar.</Label>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid w-full max-w-sm items-center gap-3">
                    <div className="flex gap-2">
                      <Checkbox
                        id="contactConfirmation"
                        defaultChecked={addToQueueConfirmation}
                        onCheckedChange={(checked) =>
                          setAddToQueueConfirmation(checked ? true : false)
                        }
                      />
                      <Label htmlFor="contactConfirmation">Adicionar à fila</Label>
                    </div>
                    {addToQueueConfirmation && (
                      <>
                        <Label htmlFor="note">Anotação (opcional)</Label>
                        <Input
                          type="text"
                          id="note"
                          {...register('note')}
                        />
                      </>
                    )}
                  </div>

                  <DialogFooter className="mt-4 w-full">
                    {isLoading ? (
                      <IconLoader2 className="mx-auto animate-spin" />
                    ) : (
                      <div className="flex w-full flex-row justify-between">
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="destructive"
                          >
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          variant="confirm"
                        >
                          Confirmar
                        </Button>
                      </div>
                    )}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => router.push(item.url)}
                className="h-fit border-2"
              >
                {item.icon && <item.icon />}
                <span className="md:text-xl">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
