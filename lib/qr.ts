import QRCode from 'qrcode'

/**
 * Genera un código QR en base64 (Data URI) a partir de un texto.
 * Optimizado para leerse fácilmente en cajas (alto contraste).
 */
export async function generateQR(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',  // Negro puro
        light: '#FFFFFF'  // Blanco puro contraste
      },
      errorCorrectionLevel: 'H' // Alta corrección para pantallas
    })
    return dataUrl
  } catch (err) {
    console.error('Error generating QR', err)
    throw err
  }
}
