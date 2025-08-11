'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Clock, MessageCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';

interface IPublicQueue {
  providerName: string;
  serializedEntries: EntryProps[];
}

type EntryProps = {
  id: number;
  order: number;
  clientId: number;
  name: string;
  whatsappNumber: string;
};

export default function QueueStatus({ providerWpp }: { providerWpp: string }) {
  const [clients, setClients] = useState<EntryProps[]>([]);
  const [providerName, setProviderName] = useState<string>('');

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentClient = clients.find((client) => client.order === 1);
  const queueClients = clients.filter((client) => client.order > 1);
  const totalInQueue = clients.length;

  const whatsappMessage = 'Olá! Gostaria de entrar na fila de atendimento.';
  const whatsappUrl = `https://wa.me/55${providerWpp}?text=${encodeURIComponent(whatsappMessage)}`;

  async function getEntries() {
    try {
      const response = await fetch(`${process.env.API_URL}/provider/queue/${providerWpp}`, {
        method: 'GET'
      });

      const responseParsed: { data: IPublicQueue; errorMessage?: string } = await response.json();

      if (responseParsed?.errorMessage) {
        return toast.error(responseParsed.errorMessage);
      }

      if (responseParsed) {
        const data = responseParsed.data.serializedEntries;
        setClients(data);
        setProviderName(responseParsed.data.providerName);
        return;
      }
    } catch (error) {
      console.log('ERROR: ', error);
      return toast.error('Erro inesperado ao obter os clientes.');
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getEntries();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      await getEntries();
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Fila de Atendimento</h1>
          <h1 className="text-xl font-bold text-gray-800">{providerName}</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span className="text-lg font-medium">{totalInQueue} pessoas na fila</span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-3">
          <p className="text-sm text-gray-500">
            Última atualização:{' '}
            {lastUpdated.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Currently Being Served */}
        {currentClient && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                Sendo Atendido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-green-900">{currentClient.name}</div>
            </CardContent>
          </Card>
        )}

        {/* Queue List */}
        {queueClients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5" />
                Próximos na Fila
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {queueClients.map((client) => (
                <div
                  key={client.order}
                  className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                >
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <Badge
                    variant="secondary"
                    className="text-sm"
                  >
                    #{client.order}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {clients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">Nenhuma pessoa na fila</h3>
              <p className="text-gray-600">Seja o primeiro a entrar na fila de atendimento!</p>
            </CardContent>
          </Card>
        )}

        {/* Join Queue Button */}
        <div className="pt-4">
          <Button
            asChild
            className="h-12 w-full text-lg"
            size="lg"
          >
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Entrar na Fila
            </Link>
          </Button>
        </div>

        {/* Footer Info */}
        <div className="pt-4 text-center text-sm text-gray-500">
          <p>Clique em "Entrar na Fila" para ser direcionado ao WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
