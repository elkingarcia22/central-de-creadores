import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI // Usar el redirect URI configurado en .env
    );

    // Generar URL de autorización
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      state: userId as string, // Pasar el userId en el state
      prompt: 'consent' // Forzar consentimiento para obtener refresh_token
    });

    return res.status(200).json({
      success: true,
      auth_url: authUrl,
      message: 'URL de autorización generada. Usar esta URL para conectar Google Calendar.',
      instructions: [
        '1. Copiar la URL de autorización',
        '2. Abrir en el navegador',
        '3. Autorizar la aplicación',
        '4. Copiar el código de autorización de la URL de retorno',
        '5. Usar el endpoint /api/google-calendar/callback con el código'
      ]
    });

  } catch (error) {
    console.error('❌ Error generando URL de autorización:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
