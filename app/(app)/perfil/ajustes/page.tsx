'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Lock, Shield, ChevronRight, Save, AlertTriangle } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function AjustesPage() {
  const router = useRouter()
  const { user, fetchProfile } = useUserStore()
  const [nombre, setNombre] = React.useState('')
  const [telefono, setTelefono] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [changingPass, setChangingPass] = React.useState(false)
  const [newPass, setNewPass] = React.useState('')
  const [confirmPass, setConfirmPass] = React.useState('')

  React.useEffect(() => {
    if (user) {
      setNombre(user.nombre || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user || !nombre.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ nombre: nombre.trim() })
      .eq('id', user.id)

    if (error) {
      toast.error('Error al guardar: ' + error.message)
    } else {
      await fetchProfile()
      toast.success('¡Perfil actualizado!')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (newPass.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPass !== confirmPass) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setChangingPass(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) {
      toast.error('Error: ' + error.message)
    } else {
      toast.success('¡Contraseña actualizada!')
      setNewPass('')
      setConfirmPass('')
    }
    setChangingPass(false)
  }

  return (
    <div className="min-h-screen bg-pf-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 pt-safe bg-pf-bg/90 backdrop-blur-xl border-b border-pf-surface-highest flex items-center gap-3 h-16">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-pf-surface-top transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-lg">Ajustes de Cuenta</h1>
      </header>

      <main className="px-6 py-6 space-y-6 max-w-lg mx-auto">

        {/* Info de cuenta */}
        <div className="pf-card p-5 border border-pf-surface-highest space-y-4">
          <h2 className="font-semibold text-sm text-pf-on-surface-var uppercase tracking-wide flex items-center gap-2">
            <User size={14} /> Información personal
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-pf-on-surface-var mb-1.5 font-medium">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-pf-surface-high text-pf-on-surface rounded-xl px-4 py-3 text-sm border border-pf-surface-highest focus:outline-none focus:border-pf-primary-ctn/50 transition-colors placeholder:text-pf-on-surface-var/50"
              />
            </div>

            <div>
              <label className="block text-xs text-pf-on-surface-var mb-1.5 font-medium">Correo electrónico</label>
              <div className="w-full bg-pf-surface-high text-pf-on-surface-var rounded-xl px-4 py-3 text-sm border border-pf-surface-highest flex items-center gap-2 cursor-not-allowed">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{user?.email || '—'}</span>
                <span className="ml-auto text-xs bg-pf-surface-highest px-2 py-0.5 rounded-md">No editable</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-pf-primary-ctn text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Cambiar contraseña */}
        <div className="pf-card p-5 border border-pf-surface-highest space-y-4">
          <h2 className="font-semibold text-sm text-pf-on-surface-var uppercase tracking-wide flex items-center gap-2">
            <Lock size={14} /> Seguridad
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-pf-on-surface-var mb-1.5 font-medium">Nueva contraseña</label>
              <input
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-pf-surface-high text-pf-on-surface rounded-xl px-4 py-3 text-sm border border-pf-surface-highest focus:outline-none focus:border-pf-primary-ctn/50 transition-colors placeholder:text-pf-on-surface-var/50"
              />
            </div>
            <div>
              <label className="block text-xs text-pf-on-surface-var mb-1.5 font-medium">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full bg-pf-surface-high text-pf-on-surface rounded-xl px-4 py-3 text-sm border border-pf-surface-highest focus:outline-none focus:border-pf-primary-ctn/50 transition-colors placeholder:text-pf-on-surface-var/50"
              />
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={changingPass || !newPass}
            className="w-full bg-pf-surface-highest text-pf-on-surface py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 border border-pf-surface-high transition-opacity"
          >
            <Shield size={16} />
            {changingPass ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </div>

        {/* Zona de peligro */}
        <div className="pf-card p-5 border border-red-500/20 bg-red-500/5 space-y-3">
          <h2 className="font-semibold text-sm text-red-400 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle size={14} /> Zona de peligro
          </h2>
          <p className="text-xs text-pf-on-surface-var">Al eliminar tu cuenta perderás todos tus passes y beneficios activos de forma permanente.</p>
          <button className="w-full border border-red-500/40 text-red-400 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-500/10 transition-colors">
            Eliminar mi cuenta
          </button>
        </div>

      </main>
    </div>
  )
}
