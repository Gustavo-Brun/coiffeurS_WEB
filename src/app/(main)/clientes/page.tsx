'use client';

import { getCookies } from '@/services/sessionManager';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DataTable from './components/Datatable';

export default function Clientes() {
  const [clients, setClients] = useState([]);

  async function getClients() {
    try {
      const session = await getCookies();

      const response = await fetch(`${process.env.BASE_URL}/clients/list`, {
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
        return setClients(responseParsed.data);
      }
    } catch (error) {
      console.log('ERROR: ', error);
      return toast.error('Erro inesperado ao obter os clientes.');
    }
  }

  useEffect(() => {
    (async () => {
      await getClients();
    })();
  }, []);

  return (
    <main>
      <DataTable clients={clients} />
    </main>
  );
}
