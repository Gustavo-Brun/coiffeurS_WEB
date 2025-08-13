'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, set } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Edit, ChevronUp, ChevronDown, ChevronsUpDown, Check, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

import { getCookies } from '@/services/sessionManager';
import { toast } from 'react-toastify';
import { IClient } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import alert from '@/components/ui/alert';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface EntryData {
  id: number;
  order: number;
  joinedAt: string;
  status: 'WAITING' | 'COMPLETED' | 'REMOVED';
  clientId: number;
  note: string;
  queueId: string;
  client: IClient;
}

export default function CardDetails({ selectedEntry }: { selectedEntry: EntryData }) {
  const [entryPrice, setEntryPrice] = useState<number>(0);

  async function editOrder(direction: 'UP' | 'DOWN') {
    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.API_URL}/queues/edit/order`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.data}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          queueId: selectedEntry.queueId,
          clientId: selectedEntry.clientId,
          direction
        })
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage || responseParsed?.data?.errorMessage) {
        toast.error(responseParsed.errorMessage || responseParsed.data.errorMessage);
        return alert.close();
      }

      if (response.status === 200) {
        toast.success('Ordem alterada com sucesso! Atualizando a fila...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 2000);
      }
    } catch (error) {
      console.log('ERROR', error);
      toast.error(
        'Ocorreu um erro ao alterar a ordem do cliente. Se o erro persistir entre em contato com nosso suporte.'
      );
    }

    return alert.close();
  }

  async function cancelCycle() {
    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.API_URL}/queues/entry/cancel`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.data}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entryId: selectedEntry.id
        })
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage || responseParsed?.data?.errorMessage) {
        toast.error(responseParsed.errorMessage || responseParsed.data.errorMessage);
        return alert.close();
      }

      if (response.status === 200) {
        toast.success('Atendimento cancelado com sucesso! Atualizando a fila...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 2000);
      }
    } catch (error) {
      console.log('ERROR', error);
      toast.error(
        'Ocorreu um erro ao cancelar o atendimento deste cliente. Se o erro persistir entre em contato com nosso suporte.'
      );
    }

    return alert.close();
  }

  async function finishCycle() {
    if (entryPrice === 0) {
      return toast.error('Por favor, informe o valor do atendimento.');
    }

    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.API_URL}/queues/entry/complete`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.data}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entryId: selectedEntry.id,
          entryPrice
        })
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage || responseParsed?.data?.errorMessage) {
        toast.error(responseParsed.errorMessage || responseParsed.data.errorMessage);
        return alert.close();
      }

      if (response.status === 200) {
        toast.success('Atendimento concluido com sucesso! Atualizando a fila...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 2000);
      }
    } catch (error) {
      console.log('ERROR', error);
      toast.error(
        'Ocorreu um erro ao finalizar o atendimento deste cliente. Se o erro persistir entre em contato com nosso suporte.'
      );
    }

    return alert.close();
  }

  let statusText: 'Aguardando' | 'Concluido' | 'Removido';

  switch (selectedEntry.status) {
    case 'WAITING':
      statusText = 'Aguardando';
      break;
    case 'COMPLETED':
      statusText = 'Concluido';
      break;
    case 'REMOVED':
      statusText = 'Removido';
      break;
  }

  useEffect(() => {
    setEntryPrice(0);
  }, [selectedEntry]);

  return (
    <div>
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              {selectedEntry.client.name}
              <Link
                target="_blank"
                href={`https://wa.me/55${selectedEntry.client.whatsappNumber}?text=Ol%C3%A1%20${selectedEntry.client.name}%2C%20sua%20vez%20est%C3%A1%20chegando!`}
              >
                <FaWhatsapp
                  size={25}
                  className="text-green-500"
                />
              </Link>
            </CardTitle>
            <span
              className={`animate-pulse rounded-full px-2 py-1 text-xs font-medium ${
                selectedEntry.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : selectedEntry.status === 'REMOVED'
                    ? 'bg-blue-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {selectedEntry.order}º {statusText}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2">
            <div>
              <label
                htmlFor="entryPrice"
                className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase"
              >
                Valor do Serviço
              </label>

              <Input
                id="entryPrice"
                type="number"
                placeholder="R$ 0,00"
                min={0}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className={`${entryPrice === 0 ? 'border-destructive' : 'border-primary'}`}
              />
            </div>
            <div className="text-end">
              <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
                Anotação
              </h3>
              <p className="text-sm">{selectedEntry.note ? selectedEntry.note : '---'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            <div className="flex flex-col gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={() => handleMoveUp(selectedEntry.id)}
                    className="flex items-center gap-2"
                  >
                    Alterar Ordem
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                >
                  <DropdownMenuItem
                    onClick={() =>
                      alert.open({
                        type: undefined,
                        message: 'Tem certeza que deseja mover o cliente para frente?',
                        buttons: [
                          {
                            label: 'Cancelar',
                            variant: 'destructive',
                            onClick: () => {
                              alert.close();
                            },
                            className: 'hover:opacity-50'
                          },
                          {
                            label: 'Sim',
                            variant: 'confirm',
                            onClick: () => {
                              editOrder('UP');
                            },
                            className: 'hover:opacity-50 px-10'
                          }
                        ]
                      })
                    }
                  >
                    Mover para frente
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      alert.open({
                        type: undefined,
                        message: 'Tem certeza que deseja mover o cliente para trás?',
                        buttons: [
                          {
                            label: 'Cancelar',
                            variant: 'destructive',
                            onClick: () => {
                              alert.close();
                            },
                            className: 'hover:opacity-50'
                          },
                          {
                            label: 'Sim',
                            variant: 'confirm',
                            onClick: () => {
                              editOrder('DOWN');
                            },
                            className: 'hover:opacity-50 px-10'
                          }
                        ]
                      })
                    }
                  >
                    Mover para trás
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  alert.open({
                    type: undefined,
                    message: `Cancelar atendimento do(a) ${selectedEntry.client.name}?`,
                    buttons: [
                      {
                        label: 'Não',
                        variant: 'destructive',
                        onClick: () => {
                          alert.close();
                        },
                        className: 'hover:opacity-50 px-10'
                      },
                      {
                        label: 'Sim',
                        variant: 'confirm',
                        onClick: () => {
                          cancelCycle();
                        },
                        className: 'hover:opacity-50 px-10'
                      }
                    ]
                  })
                }
                className="flex items-center gap-2"
              >
                Cancelar
                <X className="h-4 w-4" />
              </Button>

              <Button
                variant="confirm"
                size="sm"
                onClick={() =>
                  alert.open({
                    type: undefined,
                    message: `Concluir atendimento do(a) ${selectedEntry.client.name}?`,
                    buttons: [
                      {
                        label: 'Não',
                        variant: 'destructive',
                        onClick: () => {
                          alert.close();
                        },
                        className: 'hover:opacity-50 px-10'
                      },
                      {
                        label: 'Sim',
                        variant: 'confirm',
                        onClick: () => {
                          finishCycle();
                        },
                        className: 'hover:opacity-50 px-10'
                      }
                    ]
                  })
                }
                className="flex items-center gap-2"
              >
                Finalizar
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
