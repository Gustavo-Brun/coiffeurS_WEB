'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Circle, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { getCookies } from '@/services/sessionManager';
import type { IClient } from '@/types';
import { ptBR } from 'date-fns/locale';

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

interface SalesEntry {
  date: string;
  name: string;
  note: string;
  value: number;
}

interface PeriodSummary {
  totalEarnings: number;
  totalEntries: number;
  averagePerEntry: number;
}

export default function Relatorios() {
  const [results, setResults] = useState<DailyResult[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [monthlyData, setMonthlyData] = useState<SalesEntry[]>([]);
  const [annualData, setAnnualData] = useState<SalesEntry[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<PeriodSummary | null>(null);
  const [annualSummary, setAnnualSummary] = useState<PeriodSummary | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [annualLoading, setAnnualLoading] = useState(false);

  useEffect(() => {
    fetchDailyResults(selectedDate);
  }, [selectedDate]);

  const fetchDailyResults = async (date: Date) => {
    setLoading(true);
    try {
      const session = await getCookies();
      const dateString = format(date, 'yyyy-MM-dd');

      const response = await fetch(`${process.env.API_URL}/queues/list?date=${dateString}`, {
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

  const fetchMonthlyData = async (date: Date) => {
    setMonthlyLoading(true);
    try {
      const session = await getCookies();
      const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

      const response = await fetch(
        `${process.env.API_URL}/queues/list?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.data}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const responseParsed = await response.json();
        const entries = responseParsed.data.entries || [];

        const salesData: SalesEntry[] = entries
          .filter((entry: DailyResult) => entry.status === 'COMPLETED')
          .map((entry: DailyResult) => ({
            date: format(new Date(entry.joinedAt), 'dd/MM/yyyy'),
            name: entry.client.name,
            note: entry.note || '-',
            value: entry.price
          }));

        setMonthlyData(salesData);

        const totalEarnings = salesData.reduce((sum, entry) => sum + entry.value, 0);
        const totalEntries = salesData.length;

        setMonthlySummary({
          totalEarnings,
          totalEntries,
          averagePerEntry: totalEntries > 0 ? totalEarnings / totalEntries : 0
        });
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setMonthlyLoading(false);
    }
  };

  const fetchAnnualData = async (date: Date) => {
    setAnnualLoading(true);
    try {
      const session = await getCookies();
      const startDate = format(startOfYear(date), 'yyyy-MM-dd');
      const endDate = format(endOfYear(date), 'yyyy-MM-dd');

      const response = await fetch(
        `${process.env.API_URL}/queues/list?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.data}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const responseParsed = await response.json();
        const entries = responseParsed.data.entries || [];

        const salesData: SalesEntry[] = entries
          .filter((entry: DailyResult) => entry.status === 'COMPLETED')
          .map((entry: DailyResult) => ({
            date: format(new Date(entry.joinedAt), 'dd/MM/yyyy'),
            name: entry.client.name,
            note: entry.note || '-',
            value: entry.price
          }));

        setAnnualData(salesData);

        const totalEarnings = salesData.reduce((sum, entry) => sum + entry.value, 0);
        const totalEntries = salesData.length;

        setAnnualSummary({
          totalEarnings,
          totalEntries,
          averagePerEntry: totalEntries > 0 ? totalEarnings / totalEntries : 0
        });
      }
    } catch (error) {
      console.error('Error fetching annual data:', error);
    } finally {
      setAnnualLoading(false);
    }
  };

  const exportToCSV = (
    data: SalesEntry[] | DailyResult[],
    filename: string,
    type: 'daily' | 'period'
  ) => {
    if (data.length === 0) return;

    let csvContent = '';
    let headers = '';
    let rows = '';

    if (type === 'daily') {
      headers = 'Status;Nome;Observacao;Valor\n';
      rows = (data as DailyResult[])
        .map((entry) => {
          const status =
            entry.status === 'COMPLETED'
              ? 'Concluído'
              : entry.status === 'REMOVED'
                ? 'Removido'
                : 'Aguardando';
          const value = entry.price.toString().replace('.', ',');
          const note = entry.note || '-';
          return `"${status}";"${entry.client.name}";"${note}";"R$ ${value}"`;
        })
        .join('\n');
    } else {
      headers = 'Data;Nome;Observacao;Valor\n';
      rows = (data as SalesEntry[])
        .map((entry) => {
          const value = entry.value.toString().replace('.', ',');
          return `"${entry.date}";"${entry.name}";"${entry.note}";"R$ ${value}"`;
        })
        .join('\n');
    }

    csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleTabChange = (value: string) => {
    if (value === 'monthly' && monthlyData.length === 0) {
      fetchMonthlyData(selectedDate);
    } else if (value === 'annual' && annualData.length === 0) {
      fetchAnnualData(selectedDate);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Visualize seus ganhos e relatórios de vendas</p>
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

      <Tabs
        defaultValue="daily"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Diário</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="annual">Anual</TabsTrigger>
        </TabsList>

        {/* Daily Tab */}
        <TabsContent
          value="daily"
          className="space-y-6"
        >
          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <p className="text-muted-foreground text-xs">transações</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transações Diárias</CardTitle>
                  <CardDescription>
                    Detalhes das transações para {format(selectedDate, 'dd/MM/yyyy')}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportToCSV(
                      results,
                      `transacoes-diarias-${format(selectedDate, 'yyyy-MM-dd')}.csv`,
                      'daily'
                    )
                  }
                  disabled={results.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
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
                            <TableHead>Observação</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
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
                                <TableCell>{result.note || '-'}</TableCell>
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
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent
          value="monthly"
          className="space-y-6"
        >
          {monthlySummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ganhos Mensais</CardTitle>
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(monthlySummary.totalEarnings)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  <Calendar className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlySummary.totalEntries}</div>
                  <p className="text-muted-foreground text-xs">vendas no mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média por Venda</CardTitle>
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(monthlySummary.averagePerEntry)}
                  </div>
                  <p className="text-muted-foreground text-xs">por venda</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Relatório Mensal</CardTitle>
                  <CardDescription>
                    Vendas de {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportToCSV(
                      monthlyData,
                      `relatorio-mensal-${format(selectedDate, 'yyyy-MM')}.csv`,
                      'period'
                    )
                  }
                  disabled={monthlyData.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {monthlyLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <p>Carregando dados mensais...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-background sticky top-0 z-10">
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Observação</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyData.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-6 text-center"
                            >
                              Nenhuma venda encontrada para este mês
                            </TableCell>
                          </TableRow>
                        ) : (
                          monthlyData.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>{entry.date}</TableCell>
                              <TableCell>{entry.name}</TableCell>
                              <TableCell>{entry.note}</TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(entry.value)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Tab */}
        <TabsContent
          value="annual"
          className="space-y-6"
        >
          {annualSummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ganhos Anuais</CardTitle>
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(annualSummary.totalEarnings)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {format(selectedDate, 'yyyy', { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  <Calendar className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{annualSummary.totalEntries}</div>
                  <p className="text-muted-foreground text-xs">vendas no ano</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média por Venda</CardTitle>
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(annualSummary.averagePerEntry)}
                  </div>
                  <p className="text-muted-foreground text-xs">por venda</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Relatório Anual</CardTitle>
                  <CardDescription>
                    Vendas de {format(selectedDate, 'yyyy', { locale: ptBR })}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportToCSV(
                      annualData,
                      `relatorio-anual-${format(selectedDate, 'yyyy')}.csv`,
                      'period'
                    )
                  }
                  disabled={annualData.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {annualLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <p>Carregando dados anuais...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-background sticky top-0 z-10">
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Observação</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {annualData.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-6 text-center"
                            >
                              Nenhuma venda encontrada para este ano
                            </TableCell>
                          </TableRow>
                        ) : (
                          annualData.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>{entry.date}</TableCell>
                              <TableCell>{entry.name}</TableCell>
                              <TableCell>{entry.note}</TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(entry.value)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
