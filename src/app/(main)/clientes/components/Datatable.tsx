'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Search, Filter, Edit, Plus, ChevronDown } from 'lucide-react';

import { useForm, SubmitHandler } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IClient } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { IconLoader2 } from '@tabler/icons-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getCookies } from '@/services/sessionManager';
import { toast } from 'react-toastify';
import { log } from 'console';

type FormProps = {
  clientId: number;
  note?: string;
};

export default function DataTable({ clients }: { clients: IClient[] }) {
  const [loadingItem, setLoadingItem] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredClients, setFilteredClients] = useState<IClient[]>([]);
  const [notFound, setNotFound] = useState(false);

  const router = useRouter();

  const { register, unregister, handleSubmit } = useForm<FormProps>();

  const addToQueue: SubmitHandler<FormProps> = async (data) => {
    setIsLoading(true);

    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.API_URL}/queues/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.data}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: data.clientId,
          note: data.note
        })
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage) {
        setIsLoading(false);
        return toast.error(responseParsed.errorMessage);
      }

      if (response.status === 200) {
        setIsLoading(false);
        toast.success('Cliente agendado com sucesso!');
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

  const renderContent = useMemo(() => {
    if (clients === undefined) {
      return renderSkeleton();
    }

    if (clients.length === 0) {
      return (
        <tr>
          <td
            colSpan={4}
            className="text-muted-foreground p-10 text-center"
          >
            Ops! Parece que ainda não há clientes cadastrados.
          </td>
        </tr>
      );
    }

    return renderClients(clients);
  }, [clients, isFiltered, filteredClients, loadingItem]);

  function renderSkeleton() {
    const skeletonRows = [...Array(13)];
    const skeletonColumns = [...Array(7)];

    return skeletonRows.map((_, index) => {
      return (
        <tr
          key={index}
          className="cursor-pointer border-b border-gray-200 py-10 hover:bg-gray-100"
        >
          {skeletonColumns.map((_, index) => {
            return (
              <td
                key={index}
                className="px-4 py-4"
              >
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </td>
            );
          })}
        </tr>
      );
    });
  }

  function renderClients(clientsList: IClient[]) {
    const data = isFiltered ? filteredClients : clientsList;

    return data.map((item, index: number) => {
      return (
        <TableRow
          key={item.id}
          className="text-center"
        >
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{item.whatsappNumber}</TableCell>
          <TableCell>
            {item.lastEntry ? new Date(item.lastEntry).toLocaleDateString('pt-BR') : '-'}
          </TableCell>
          <TableCell className="text-right">
            <Dialog onOpenChange={(open) => setLoadingItem(open ? index : undefined)}>
              <DialogTrigger asChild>
                <SidebarMenuButton
                  onClick={() => {
                    unregister('clientId');
                    register('clientId', { value: item.id });
                  }}
                  className="mx-auto w-fit cursor-pointer"
                >
                  {loadingItem === index ? (
                    <IconLoader2 className="mx-auto animate-spin" />
                  ) : (
                    <>
                      <span> Adicionar à fila</span>
                      <Plus />
                    </>
                  )}
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-md"
                aria-describedby={undefined}
              >
                <DialogHeader>
                  <DialogTitle>Adicionar {item.name} à fila?</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(addToQueue)}
                  className="my-4 flex flex-col items-center gap-4"
                >
                  <div className="flex w-full max-w-sm flex-col gap-3">
                    <Label htmlFor="note">Anotação (opcional)</Label>
                    <Input
                      type="text"
                      id="note"
                      {...register('note')}
                    />
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
          </TableCell>
        </TableRow>
      );
    });
  }

  function filterClients(query: string) {
    if (!clients) return;

    const filteredByName = clients.filter((client) =>
      client.name.toLowerCase().includes(query.toLowerCase())
    );
    const filteredByWhatsappNumber = clients.filter((client) =>
      client.whatsappNumber.trim().includes(query.trim())
    );

    if (filteredByName.length >= 1 || filteredByWhatsappNumber.length >= 1) {
      return setFilteredClients(
        filteredByName.length >= 1 ? filteredByName : filteredByWhatsappNumber
      );
    }

    if (filteredByName.length < 1 || filteredByWhatsappNumber.length < 1) {
      setNotFound(true);
      return setFilteredClients([]);
    }
  }

  const handleSearch = (query: string) => {
    setNotFound(false);
    const checkFilledQuery = () => query.trim().length >= 1;

    if (!checkFilledQuery()) {
      setFilteredClients([]);
      setIsFiltered(false);
      return;
    }

    filterClients(query);
    return setIsFiltered(true);
  };

  return (
    <div className="w-full space-y-4 p-6">
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground const [isLoading, setIsLoading] = useState(false); absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Busque pelo nome ou whatsapp..."
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
          {notFound && (
            <p className="mt-2 text-sm text-red-600 md:w-full">
              Não encontramos um cliente com este nome ou número de WhatsApp.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div className="flex items-center justify-center space-x-2">
                  <span>Nome</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M2.25 7C2.25 6.58579 2.58579 6.25 3 6.25H13C13.4142 6.25 13.75 6.58579 13.75 7C13.75 7.41421 13.4142 7.75 13 7.75H3C2.58579 7.75 2.25 7.41421 2.25 7ZM16.5 6.25C16.7951 6.25 17.0628 6.42309 17.1839 6.69223L21.6839 16.6922C21.8539 17.07 21.6855 17.514 21.3078 17.6839C20.93 17.8539 20.486 17.6855 20.3161 17.3078L18.8787 14.1136H14.1213L12.6839 17.3078C12.514 17.6855 12.07 17.8539 11.6922 17.6839C11.3145 17.514 11.1461 17.07 11.3161 16.6922L15.8161 6.69223C15.9372 6.42309 16.2049 6.25 16.5 6.25ZM14.7963 12.6136H18.2037L16.5 8.82764L14.7963 12.6136ZM2.25 12C2.25 11.5858 2.58579 11.25 3 11.25H10C10.4142 11.25 10.75 11.5858 10.75 12C10.75 12.4142 10.4142 12.75 10 12.75H3C2.58579 12.75 2.25 12.4142 2.25 12ZM2.25 17C2.25 16.5858 2.58579 16.25 3 16.25H8C8.41421 16.25 8.75 16.5858 8.75 17C8.75 17.4142 8.41421 17.75 8 17.75H3C2.58579 17.75 2.25 17.4142 2.25 17Z"
                            fill="#1C274C"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => sortByColumn('nome')}>
                        Ordenar A-Z
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => sortByColumn('nome')}>
                        Ordenar Z-A
                      </DropdownMenuItem>
                    </DropdownMenuContent> */}
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center space-x-2">
                  <span>WhatsApp</span>

                  <svg
                    fill="#000000"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="800px"
                    height="800px"
                    viewBox="0 0 30.667 30.667"
                    xmlSpace="preserve"
                    className="h-[14px] w-[14px] p-0 md:h-4 md:w-4"
                  >
                    <g>
                      <path
                        d="M30.667,14.939c0,8.25-6.74,14.938-15.056,14.938c-2.639,0-5.118-0.675-7.276-1.857L0,30.667l2.717-8.017
      c-1.37-2.25-2.159-4.892-2.159-7.712C0.559,6.688,7.297,0,15.613,0C23.928,0.002,30.667,6.689,30.667,14.939z M15.61,2.382
      c-6.979,0-12.656,5.634-12.656,12.56c0,2.748,0.896,5.292,2.411,7.362l-1.58,4.663l4.862-1.545c2,1.312,4.393,2.076,6.963,2.076
      c6.979,0,12.658-5.633,12.658-12.559C28.27,8.016,22.59,2.382,15.61,2.382z M23.214,18.38c-0.094-0.151-0.34-0.243-0.708-0.427
      c-0.367-0.184-2.184-1.069-2.521-1.189c-0.34-0.123-0.586-0.185-0.832,0.182c-0.243,0.367-0.951,1.191-1.168,1.437
      c-0.215,0.245-0.43,0.276-0.799,0.095c-0.369-0.186-1.559-0.57-2.969-1.817c-1.097-0.972-1.838-2.169-2.052-2.536
      c-0.217-0.366-0.022-0.564,0.161-0.746c0.165-0.165,0.369-0.428,0.554-0.643c0.185-0.213,0.246-0.364,0.369-0.609
      c0.121-0.245,0.06-0.458-0.031-0.643c-0.092-0.184-0.829-1.984-1.138-2.717c-0.307-0.732-0.614-0.611-0.83-0.611
      c-0.215,0-0.461-0.03-0.707-0.03S9.897,8.215,9.56,8.582s-1.291,1.252-1.291,3.054c0,1.804,1.321,3.543,1.506,3.787
      c0.186,0.243,2.554,4.062,6.305,5.528c3.753,1.465,3.753,0.976,4.429,0.914c0.678-0.062,2.184-0.885,2.49-1.739
      C23.307,19.268,23.307,18.533,23.214,18.38z"
                      />
                    </g>
                  </svg>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center space-x-2">
                  <span>Última visita</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 7L2 7"
                            stroke="#1C274C"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8 12H2"
                            stroke="#1C274C"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 17H2"
                            stroke="#1C274C"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="17"
                            cy="12"
                            r="5"
                            stroke="#1C274C"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M17 10V11.8462L18 13"
                            stroke="#1C274C"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => sortByColumn('ultimaVisita')}>
                        Mais recente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => sortByColumn('ultimaVisita')}>
                        Mais antiga
                      </DropdownMenuItem>
                    </DropdownMenuContent> */}
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center justify-center space-x-2">
                  <span>Ações</span>

                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 7L2 7"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      opacity="0.5"
                      d="M19 12L5 12"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderContent}</TableBody>
        </Table>
      </div>
    </div>
  );
}
