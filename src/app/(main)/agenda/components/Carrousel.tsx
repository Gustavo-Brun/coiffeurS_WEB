'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import { Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { IClient } from '@/types';

interface ICarrousel {
  cards: EntryData[];
  cardCallback: (card: EntryData) => void;
}

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

export default function Carrousel({ cards, cardCallback }: ICarrousel) {
  const [selectedCard, setSelectedCard] = useState<EntryData>(cards[0]);
  const [api, setApi] = useState<CarouselApi>();

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', (type, event) => {
      const key = type.selectedScrollSnap();

      setSelectedCard(cards[key]);
      cardCallback(cards[key]);
    });
  }, [api]);

  return (
    <div className="m-auto w-full">
      <Carousel
        setApi={setApi}
        orientation="horizontal"
        className="m-auto max-w-3xs md:max-w-[70%]"
      >
        <CarouselContent className="flex h-48 items-center border-red-500 md:h-[200px]">
          {cards.map((card, index) => (
            <CarouselItem
              key={index}
              className="pt-1 md:basis-1/2"
            >
              <div className="p-1">
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md md:py-10 ${
                    selectedCard.id === card.id ? 'ring-primary ring-2' : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold tabular-nums">
                      {card.client.name}
                    </CardTitle>
                    <CardDescription>{card.note} </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
