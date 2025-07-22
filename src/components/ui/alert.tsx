'use client';

import React, { useState, useMemo, useRef } from 'react';

import { Card, CardContent, CardFooter, CardHeader } from './card';

import { X } from 'lucide-react';
import { Button } from './button';

interface AlertProps {
  type: 'error' | 'success' | undefined;
  closeButton?: 'none' | 'mobile' | 'web';
  message?: string;
  onClose?: () => void;
  animation?: 'success' | 'cat' | 'catError' | 'catNotFound' | 'dog';
  buttons?: {
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'confirm';
    label: string;
    onClick?: () => void;
    className?: string;
  }[];
}

let open = (alert: AlertProps) => {};
let close = () => {};

function Alert() {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  const hasAlert = useMemo(() => !!alerts.length, [alerts]);
  const alert = useMemo(() => alerts[alerts.length - 1], [alerts]);

  const cardRef = useRef<HTMLDivElement>(null);

  open = (alert: AlertProps) => {
    setAlerts((prevAlerts) => [...prevAlerts, { ...alert }]);
  };

  close = () => {
    if (cardRef) {
      setTimeout(() => {
        setAlerts((prevAlerts) => {
          if (prevAlerts.length > 0 && prevAlerts[0].onClose) {
            prevAlerts[0].onClose();
          }
          return prevAlerts.filter((_, index) => index !== 0);
        });
      }, 500);
    }
  };

  if (!hasAlert) return null;

  return (
    <section
      onClick={() => close()}
      className="fixed top-0 z-40 flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)]"
    >
      <Card
        ref={cardRef}
        className="animate-fadeIn relative z-50 mx-4 max-w-md px-4 pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="-mb-12 flex gap-3 text-xl font-semibold text-black">
          {alert.closeButton !== 'none' && (
            <X
              className={`absolute top-4 right-4 cursor-pointer text-2xl ${alert.closeButton === 'mobile' && 'block md:hidden'} ${alert.closeButton === 'web' && 'hidden md:block'}`}
              onClick={() => close()}
            />
          )}
          {alert.type === 'error' && (
            <p>Desculpe, algo inesperado aconteceu. Tente novamente mais tarde.</p>
          )}
          {alert.type === 'success' && <p>Sucesso!</p>}
        </CardHeader>
        <CardContent>
          <span className="text-black">{alert.message}</span>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          {alert.buttons?.map((button, index) => (
            <Button
              key={index}
              size={button.size}
              variant={button.variant}
              onClick={button?.onClick}
              className={button.className}
            >
              {button.label}
            </Button>
          ))}
        </CardFooter>
      </Card>
    </section>
  );
}

export default {
  Component: React.memo(Alert),
  open: (alert: AlertProps) => open(alert),
  close: () => close()
};
