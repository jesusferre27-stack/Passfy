export const metadata = { title: 'Configuración | PASSFY Admin' }

export default function AdminConfigPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e4e1ed]">Configuración Global</h2>
          <p className="text-sm text-[#e4bebc]">Ajustes de la plataforma</p>
        </div>
      </div>

      <div className="bg-[#13131b] rounded-2xl border border-[#1e1e28] p-6 space-y-6">
        
        {/* Seccion 1 */}
        <div>
          <h3 className="text-[#e4e1ed] font-semibold text-sm mb-4 border-b border-[#1e1e28] pb-2">Seguridad y Acceso</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#e4bebc] block mb-1">Email de Administrador</label>
              <input 
                type="text" 
                readOnly 
                value={process.env.ADMIN_EMAIL || 'No configurado'} 
                className="w-full bg-[#1a1a23] border border-[#1e1e28] rounded-xl px-4 py-2.5 text-sm text-white/50 cursor-not-allowed font-mono"
              />
              <p className="text-[10px] text-[#e4bebc]/50 mt-1">Definido en Vercel Environment Variables</p>
            </div>
          </div>
        </div>

        {/* Seccion 2 */}
        <div>
          <h3 className="text-[#e4e1ed] font-semibold text-sm mb-4 border-b border-[#1e1e28] pb-2">Programa de Afiliados</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#e4bebc] block mb-1">Comisión por Defecto (%)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  defaultValue={15}
                  className="w-32 bg-[#1a1a23] border border-[#1e1e28] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#30a193]"
                />
                <button className="bg-[#1e1e28] hover:bg-[#1f1f28] text-white px-4 py-2.5 rounded-xl text-sm transition-colors border border-[#1e1e28]">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
