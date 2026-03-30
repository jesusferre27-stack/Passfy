'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParams = searchParams.get('redirect')
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error('Error al registrar', {
        description: error.message,
      })
      setIsLoading(false)
      return
    }

    toast.success('¡Registro exitoso!', {
      description: 'Por favor revisa tu correo para confirmar tu cuenta.',
    })
    setIsLoading(false)
    router.push('/login')
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectParams || '/wallet'}`,
      },
    })
  }

  return (
    <div className="pf-card p-8">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="pf-headline text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-pf-on-surface-var">Ingresa tus datos para empezar a ahorrar.</p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                disabled={isLoading}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-pf-error">{errors.name.message}</p>}
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-pf-error">{errors.password.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-xs text-pf-error">{errors.confirmPassword.message}</p>}
            </div>
            
            <Button disabled={isLoading} type="submit" className="mt-4">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-pf-surface-highest" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-pf-surface px-2 text-pf-on-surface-var">O continúa con</span>
          </div>
        </div>

        <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleLogin}>
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Registrarse con Google
        </Button>
      </div>

      <p className="px-8 text-center text-sm text-pf-on-surface-var mt-8">
        ¿Ya tienes una cuenta?{' '}
        <Link href={`/login${redirectParams ? `?redirect=${redirectParams}` : ''}`} className="text-pf-primary hover:underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-pf-primary" /></div>}>
      <RegisterContent />
    </React.Suspense>
  )
}
