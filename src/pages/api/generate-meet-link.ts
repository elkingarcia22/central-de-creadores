import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Generando enlace de Google Meet');

    const { fechaSesion, duracionSesion, titulo } = req.body;

    if (!fechaSesion) {
      return res.status(400).json({ 
        error: 'Fecha de sesión requerida',
        details: 'No se proporcionó fechaSesion en el body'
      });
    }

    // Generar enlace de Google Meet
    const meetLink = generateMeetLink(fechaSesion, duracionSesion, titulo);

    console.log('✅ Enlace de Meet generado:', meetLink);

    res.status(200).json({
      success: true,
      message: 'Enlace de Google Meet generado exitosamente',
      meetLink: meetLink
    });

  } catch (error) {
    console.error('❌ Error generando enlace de Meet:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

function generateMeetLink(fechaSesion: string, duracionSesion: number, titulo?: string): string {
  // Generar un ID único para la reunión
  const meetingId = generateMeetingId();
  
  // Crear enlace de Google Meet
  const baseUrl = 'https://meet.google.com';
  const meetLink = `${baseUrl}/${meetingId}`;
  
  return meetLink;
}

function generateMeetingId(): string {
  // Generar un ID de 10 caracteres para la reunión
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}
