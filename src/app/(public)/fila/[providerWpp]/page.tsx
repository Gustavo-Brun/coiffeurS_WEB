import QueueStatus from './components/QueueStatus';

export default async function QueuePage({ params }: { params: Promise<{ providerWpp: string }> }) {
  const { providerWpp } = await params;
  return <QueueStatus providerWpp={providerWpp} />;
}
