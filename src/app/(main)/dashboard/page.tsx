'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Circle } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getCookies } from '@/services/sessionManager';
import { IClient } from '@/types';
import { ptBR } from 'date-fns/locale';
import { endpointWriteToDisk } from 'next/dist/build/swc/generated-native';

interface DailyResult {
  client: IClient;
  id: string;
  clientId: number;
  joinedAt: string;
  note: string;
  order: number;
  price: number;
  queueId: string;
  status: 'WAITING' | 'COMPLETED' | 'REMOVED';
}

interface DailySummary {
  date: string;
  totalEarnings: number;
  totalValidEntries: number;
}

export default function Dashboard() {
  const [results, setResults] = useState<DailyResult[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    fetchDailyResults(selectedDate);
  }, [selectedDate]);

  const fetchDailyResults = async (date: Date) => {
    setLoading(true);
    try {
      const session = await getCookies();
      const dateString = format(date, 'yyyy-MM-dd');

      // Replace with your actual API endpoint
      const response = await fetch(`${process.env.BASE_URL}/queues/list?date=${dateString}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.data}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseParsed = await response.json();
        setResults(responseParsed.data.entries || []);

        const totalEarnings = (responseParsed.data.entries as DailyResult[]).reduce(
          (accumulator, currentItem) => accumulator + currentItem.price,
          0
        );

        setSummary({
          date: format(date, 'yyyy-MM-dd'),
          totalEarnings,
          totalValidEntries: (responseParsed.data.entries as DailyResult[]).filter(
            (entry) => entry.status === 'COMPLETED'
          ).length
        });
      } else {
        console.error('Failed to fetch daily results');
      }
    } catch (error) {
      console.error('Error fetching daily results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Resultados Diários</h1>
          <p className="text-muted-foreground">Visualize seus ganhos diários e transações</p>
        </div>

        <Popover
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, 'PPP', { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
          >
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              lang="pt-BR"
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalEarnings)}
              </div>
              <p className="text-muted-foreground text-xs">
                para {format(selectedDate, 'MMMM d, yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações Realizadas</CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalValidEntries}</div>
              <p className="text-muted-foreground text-xs">transações </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Transação</CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  summary.totalValidEntries > 0
                    ? summary.totalEarnings / summary.totalValidEntries
                    : 0
                )}
              </div>
              <p className="text-muted-foreground text-xs">por transação</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Diárias</CardTitle>
          <CardDescription>
            Detalhes das transações para {format(selectedDate, 'dd/MM/yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p>Carregando resultados...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="max-h-[400px] overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-background sticky top-0 z-10">
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="py-6 text-center"
                          >
                            Não encontramos transações para essa data
                          </TableCell>
                        </TableRow>
                      ) : (
                        results.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="flex items-center justify-center font-medium">
                              <Circle
                                className={`h-4 w-4 ${
                                  result.status === 'COMPLETED'
                                    ? 'fill-green-500'
                                    : result.status === 'REMOVED'
                                      ? 'fill-red-500'
                                      : 'fill-yellow-500'
                                }`}
                              />
                            </TableCell>
                            <TableCell>{result.client.name}</TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(result.price)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
