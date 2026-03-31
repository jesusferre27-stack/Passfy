import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if admin
    const adminEmail = process.env.ADMIN_EMAIL
    if (!user || !adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { passId, activo } = await req.json()
    if (!passId || typeof activo !== 'boolean') {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('passes').update({ activo }).eq('id', passId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
