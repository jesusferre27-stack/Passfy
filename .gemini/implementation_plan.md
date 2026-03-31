# Panel de Afiliados y Corrección de Bugs en Passfy

Este documento detalla el plan para implementar el Panel de Afiliados y solucionar dos bugs específicos en la PWA.

## User Review Required

> [!IMPORTANT]
> A continuación se detallan los cambios propuesto para el Panel de Afiliados, la integración con la base de datos de Supabase y la corrección de los bugs persistentes. Por favor, revisa las rutas API que se van a crear y el flujo de los enlaces antes de proceder.

## Proposed Changes

### 1. Corrección de Bugs de PWA
- **Crear `components/PWAInstallButton.tsx` (Client component):**
  - Implementar hook para escuchar el evento `beforeinstallprompt` usando `useEffect` y `useRef`.
  - Crear Lógica del botón: Si el evento está disponible, pedir instalación. Si no lo está, mostrar modales o toasts con instrucciones específicas de Chrome (iOS, Android, Desktop).
- **Actualizar `app/(app)/perfil/page.tsx`:** 
  - Reemplazar el botón de instalación estático actual por el nuevo componente `<PWAInstallButton />`.

### 2. Actualización Botón de Afiliado en Perfil
- **Modificar `app/(app)/perfil/page.tsx`:**
  - Actualizar `handleCreateAffiliate` para crear la entrada con `comision_pct: 15`.
  - Agregar la redirección (`router.push('/afiliado')`) después del Toast "¡Bienvenido al programa!".
  - Cambiar el enlace estático existente en el JSX que apunta a `/afiliados` a `/afiliado`.

### 3. Middleware Tracking (`middleware.ts`)
- **Modificar `middleware.ts`:**
  - Capturar el argumento `?ref=` de la URL entrante.
  - Guardar el valor en una cookie `affiliate_ref` con expiración de 30 días, tal cual lo solicitan en los requerimientos.

### 4. Rutas API de Afiliados
- **Crear `app/api/affiliate/stats/route.ts`:**
  - Consultar estadísticas globales del afiliado asociado al usuario autenticado (desde `affiliate_sales`).
- **Crear `app/api/affiliate/sales/route.ts`:**
  - Obtener las últimas 20 ventas con el nombre del pass (vía JOIN manual o directo por Supabase relations) y estado de pagado.

### 5. Tracking de Ventas
- **Modificar `/api/passes/activate/...` (si corresponde) o donde se haga la compra:**
  - Modificar `/api/mercadopago/webhook/route.ts` o el lugar correcto para grabar la venta a `affiliate_sales` usando la cookie o metadatos de MB si se aplican. *Investigaremos el flujo de venta exacto para inyectarlo en el pago correcto*.

### 6. Panel de Afiliados (`app/(app)/afiliado/page.tsx`)
- Crear desde cero un diseño atractivo utilizando el token system / CSS de Passfy y Lucide React, con la estructura solicitada:
  - Header (con Avatar/Iniciales).
  - Tarjeta de Código (Botones Copiar y WhatsApp).
  - Tarjetas de Estadísticas (Ventas, Comisión, Total).
  - Gráfico de Rendimiento (Recharts).
  - CTA Motivacional (Botón TikTok/WA).
  - Listado de Ventas Recientes.
  - Sección "Cómo funciona".

## Open Questions

1. Sobre el evento de tracking de compra desde `api/passes/activate` o donde se procese: Normalmente la cookie vive en el navegador pero un webhook de Mercado Pago no tiene cookies directamente. ¿Se asocia la cookie temporalmente al momento de crear la preferencia de pago para que llegue por webhook? Investigaremos este comportamiento.

## Verification Plan

### Automated Tests
* N/A

### Manual Verification
1. Visitar perfil, no ver "Afiliado", dar clic, validar BD con `comision_pct`, ver que viaja a `/afiliado`.
2. Visitar endpoint `/afiliado` como user autenticado y ver que se renderiza Recharts y stats correctamente.
3. Al obtener link e invitar en el navegador, ver que `middleware.ts` carga el set-cookie `affiliate_ref`.
4. El botón "Instalar" debe reaccionar acorde al soporte de PWA.
