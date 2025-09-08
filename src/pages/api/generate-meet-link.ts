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
  try {
    // Crear un ID único para la sesión basado en fecha y timestamp
    const fecha = new Date(fechaSesion);
    const fechaStr = fecha.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = Date.now().toString(36);
    
    // Crear un ID de reunión único pero válido
    const meetingId = `${fechaStr}-${timestamp}`.substring(0, 15);
    
    // Usar el enlace de Google Meet que funciona para crear reuniones
    const meetLink = `https://meet.google.com/new?meetingId=${meetingId}`;
    
    console.log('🔗 Enlace generado:', meetLink);
    return meetLink;
  } catch (error) {
    console.error('❌ Error generando enlace de Meet:', error);
    // Fallback: usar enlace simple de nueva reunión
    return 'https://meet.google.com/new';
  }
}

