# Panel de Afiliados Completado

Se han llevado a cabo las modificaciones y creaciones requeridas para el nuevo Panel de Afiliados de Passfy y se han resuelto los bugs reportados.

## 1. Correcciones Iniciales
- **PWAInstallButton Component**: Se extrajo la lógica de instalación en un Client Component dedicado (`components/PWAInstallButton.tsx`). Este componente maneja el evento `beforeinstallprompt` y si la PWA no se puede instalar directamente, notifica al usuario con instrucciones correctas según su sistema operativo (Abre en Safari/Chrome, etc.).
- **Botón de Afiliado Funcional**: Se actualizó el flujo en tu perfil. Ahora al unirte al programa de afiliados se establece por defecto un `comision_pct` del 15% y en caso de éxito, el sistema es capaz de redirigirte inmediatamente al nuevo portal (`/afiliado`).

## 2. Tracking Integral de Mercado Pago
La solución propuesta para que los webhooks procesen afiliados correctamente sin perder los referidos ha sido implementada:
- **Middleware**: Capturamos referidos desde enlaces mediante `?ref=CODIGO` y asignamos la cookie `affiliate_ref` con una cadencia de 30 días.
- **Checkout Metadata**: Al inicializar la Preferencia en `/api/mercadopago/process/route.ts` leemos la cookie desde los Request Headers y lo incrustamos en un payload como `metadata.affiliate_code`.
- **Webhook Webhook**: En el endpoint de Webhooks, capturamos este campo de la metadata y aseguramos un registro íntegro de conversión. Generamos la venta en `affiliate_sales` para el afiliado con un registro atado directamente al `user_pass`.

## 3. Panel de Afiliados
Para que los usuarios puedan trackear su balance y referidos se creó el portal `app/(app)/afiliado/page.tsx` dotado de toda la interfaz pedida:
1. **Tarjeta de Código:** Cuenta con el prefijo "REF-" junto a un generador pseudo-aleatorio de código e iniciales del usuario, renderizado en fuente monospace y acentos en **Passfy Primary** (`#F8323B`). Se anexaron atajos a Portapapeles y WhatsApp.
2. **Balance (Stats):** Se despliegan contadores traídos directamente desde `api/affiliate/stats` calculando ventas en el mes y balance (pagado vs pendiente).
3. **Gráfica Recharts Semanal:** Se implementó una gráfica de baras Recharts a color rojo de 4 semanas de intervalo de los registros pasados en `affiliate_sales`.
4. **Ventas Recientes**: Se consulta la base de ventas e inyectó un registro cruzado para traer los nombres de los passes (Beneficios de Passfy).

## Ejecución Completa
El código se guardó y se implementó a main con el respectivo `git push`. La Vercel platform ya se debe estar actualizando en este momento.

> [!TIP]
> Visita y comprueba interactuando con **https://passfy.vercel.app/afiliado** para ver el sistema funcionando end-to-end simulando la vista móvil a 390px.
