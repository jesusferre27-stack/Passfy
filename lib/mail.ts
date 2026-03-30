import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPassActivationEmail({
  email,
  nombre,
  passName,
  codigoUnico
}: {
  email: string
  nombre: string
  passName: string
  codigoUnico: string
}) {
  try {
    await resend.emails.send({
      from: 'PASSFY <hola@passfy.mx>', // Asumiendo un dominio configurado, Resend requiere domain verification
      to: email,
      subject: `¡Tu ${passName} ha sido activado!`,
      html: `
        <div style="font-family: sans-serif; background-color: #13131B; color: #E4E1ED; padding: 40px; text-align: center;">
          <h1 style="color: #FF535B;">¡Felicidades ${nombre}!</h1>
          <p>Tu <strong>${passName}</strong> fue activado exitosamente.</p>
          <div style="background-color: #292932; padding: 20px; border-radius: 16px; margin: 30px auto; max-width: 300px;">
            <p style="margin: 0; font-size: 12px; color: #E4BEBC; text-transform: uppercase;">Código Único</p>
            <p style="margin: 10px 0 0; font-family: monospace; font-size: 24px; color: #6FD8C8; letter-spacing: 2px;">
              ${codigoUnico}
            </p>
          </div>
          <p>Entra a tu Wallet para descargar el código QR y comenzar a usar tus beneficios.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/wallet" style="display: inline-block; background-color: #FF535B; color: #5B000E; padding: 14px 28px; text-decoration: none; border-radius: 99px; font-weight: bold; margin-top: 20px;">
            Ir a mi Wallet
          </a>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending email via Resend:', error)
    // No throw, para no romper la activación si falla el correo temporalmente
  }
}
