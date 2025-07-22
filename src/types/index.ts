export interface IClient {
  id: number;
  providerId: number;
  name: string;
  whatsappNumber: string;
  createdAt: string;
  updatedAt: string | null;
  lastEntry: string | undefined;
}
