'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ApiError, api } from '@/lib/api';
import { AuthShell, Field } from '@/components/auth-shell';

const schema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo de 3 caracteres')
    .max(40, 'Máximo de 40 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await api.register(values);
      toast.success('Conta criada com sucesso! Faça login.');
      router.replace('/login');
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? 'Não foi possível criar a conta. Verifique os dados.'
          : 'Não foi possível conectar ao servidor.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>Comece a organizar suas finanças.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Usuário" error={errors.username?.message}>
              <Input
                placeholder="seu_usuario"
                autoComplete="username"
                {...register('username')}
              />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                {...register('email')}
              />
            </Field>
            <Field label="Senha" error={errors.password?.message}>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar conta
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
