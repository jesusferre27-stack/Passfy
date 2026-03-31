# Tareas de Implementación

- [x] **BUG 1: PWAInstallButton**
  - [x] Crear `components/PWAInstallButton.tsx`.
  - [x] Reemplazar botón en `app/(app)/perfil/page.tsx`.

- [x] **BUG 2: Botón de Afiliado en Perfil**
  - [x] Modificar `handleCreateAffiliate` en `app/(app)/perfil/page.tsx` (agregar comision_pct: 15 y redirección).

- [x] **Middleware & Tracking (Paso 1 y 2)**
  - [x] Guardar cookie `affiliate_ref` en `middleware.ts`.
  - [x] Leer cookie en `app/api/mercadopago/process/route.ts` y guardar en metadata MP.
  - [x] Leer metadata en `app/api/mercadopago/webhook/route.ts` y crear el insert a `affiliate_sales`.

- [x] **Rutas API de Afiliados**
  - [x] GET `/api/affiliate/stats`
  - [x] GET `/api/affiliate/sales`

- [x] **Panel de Afiliado**
  - [x] Instalar `recharts` (si es necesario).
  - [x] Crear interfaz en `app/(app)/afiliado/page.tsx`.

- [ ] **Git**
  - [ ] Commit y Push.
