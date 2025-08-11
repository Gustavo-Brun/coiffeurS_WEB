'use client';

import Carrousel from './components/Carrousel';
import { useEffect, useState } from 'react';
import CardDetails from './components/EntryDetails';
import { getCookies } from '@/services/sessionManager';
import { toast } from 'react-toastify';
import { IClient } from '@/types';

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

export default function Agenda() {
  const [entries, setEntries] = useState<EntryData[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<EntryData>();

  async function getEntries() {
    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.API_URL}/queues/list`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.data}`
        }
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage) {
        return toast.error(responseParsed.errorMessage);
      }

      if (responseParsed) {
        const data = responseParsed.data.entries.filter(
          (entry: EntryData) => entry.status === 'WAITING'
        );
        setEntries(data);
        setSelectedEntry(data[0]);
        return;
      }
    } catch (error) {
      console.log('ERROR: ', error);
      return toast.error('Erro inesperado ao obter os clientes.');
    }
  }

  useEffect(() => {
    (async () => {
      await getEntries();
    })();
  }, []);

  return (
    <>
      {entries.length >= 1 ? (
        <div className="flex w-full flex-col justify-around gap-2 border-2">
          <Carrousel
            cards={entries}
            cardCallback={setSelectedEntry}
          />
          <CardDetails selectedEntry={selectedEntry!} />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 p-10">
          <h1 className="text-2xl font-bold">Não há nenhum cliente na fila.</h1>
        </div>
      )}
    </>
  );
}
