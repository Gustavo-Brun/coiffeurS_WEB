'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setCookies } from '@/services/sessionManager';
import { IconLoader2 } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  console.log(process.env.BASE_URL);

  const router = useRouter();

  type FormProps = {
    email: string;
    password: string;
  };

  const { register, handleSubmit } = useForm<FormProps>();

  const onSubmitFx: SubmitHandler<FormProps> = async (data) => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/provider/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      const responseParsed = await response.json();

      if (responseParsed?.errorMessage) {
        return toast.error(responseParsed.errorMessage);
      }

      if (responseParsed) {
        await setCookies(responseParsed);
        toast.success(
          'Login realizado com sucesso! Você será redirecionado em alguns instantes...'
        );
        router.push('/agenda');
      }
    } catch (error: any) {
      console.log('ERROR: ', error);
      return toast.error('Erro inesperado ao tentar fazer login.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}

        {/* Login Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <div className="m-auto w-2/3">
              <Image
                src="/logo.png"
                alt="logo"
                width={594}
                height={410}
              />
            </div>
            <CardTitle className="text-center">Sistema para Barbearias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={handleSubmit(onSubmitFx)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Insira seu email de acesso"
                  required
                  {...register('email')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Insira sua senha de acesso"
                  required
                  {...register('password')}
                />
              </div>
              <div className="flex justify-end text-sm">
                <a
                  target="_blank"
                  href={process.env.SUPPORT_LINK as string}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Problemas com o acesso?
                </a>
              </div>
              <Button
                type="submit"
                className="w-full"
              >
                {loading ? <IconLoader2 className="mx-auto animate-spin" /> : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
