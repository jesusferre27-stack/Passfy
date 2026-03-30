'use client'

import * as React from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const resetSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
})

type ResetFormValues = z.infer<typeof resetSchema>

export default function RecoverPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/wallet`,
    })

    if (error) {
      toast.error('Error al recuperar contraseña', {
        description: error.message,
      })
      setIsLoading(false)
      return
    }

    toast.success('¡Correo enviado!', {
      description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
    })
    setIsLoading(false)
  }

  return (
    <div className="pf-card p-8">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="pf-headline text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
        <p className="text-sm text-pf-on-surface-var">Ingresa tu correo para recibir un enlace de recuperación.</p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-pf-error">{errors.email.message}</p>}
            </div>
            
            <Button disabled={isLoading} type="submit" className="mt-4">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </div>
        </form>
      </div>

      <p className="px-8 text-center text-sm text-pf-on-surface-var mt-8">
        ¿Recordaste tu contraseña?{' '}
        <Link href={`/login`} className="text-pf-primary hover:underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
