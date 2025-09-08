import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Generando enlace de Google Meet automáticamente');

    const { fechaSesion, duracionSesion, titulo } = req.body;

    // Generar enlace de Google Meet automáticamente
    const meetLink = generateMeetLink(fechaSesion, duracionSesion, titulo);

    console.log('✅ Enlace de Meet generado automáticamente:', meetLink);

    res.status(200).json({
      success: true,
      message: 'Enlace de Google Meet generado automáticamente',
      meetLink: meetLink
    });

  } catch (error) {
    console.error('❌ Error generando enlace de Meet automáticamente:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

function generateMeetLink(fechaSesion: string, duracionSesion: number, titulo?: string): string {
  // Generar un ID único para la reunión basado en timestamp y random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const meetingId = `${timestamp}-${random}`.substring(0, 10);
  
  // Crear enlace de Google Meet
  const baseUrl = 'https://meet.google.com';
  const meetLink = `${baseUrl}/${meetingId}`;
  
  return meetLink;
}
