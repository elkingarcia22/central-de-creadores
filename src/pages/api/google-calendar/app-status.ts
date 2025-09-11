import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Determinar la URI de redirección según el entorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://central-de-creadores-fl3jqqbly-elkin-garcias-projects-a0b1beb6.vercel.app' 
                     : 'http://localhost:3000');
    
    const redirectUri = `${baseUrl}/api/google-calendar/callback`;

    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Verificar configuración
    const config = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      environment: process.env.NODE_ENV,
      base_url: baseUrl,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    };

    // Generar URL de prueba
    const testAuthUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.scopes,
      state: 'test-user-id',
      prompt: 'consent',
      include_granted_scopes: true
    });

    return res.status(200).json({
      success: true,
      config,
      test_auth_url: testAuthUrl,
      message: 'Configuración de Google Calendar verificada',
      instructions: [
        '1. Verifica que la aplicación esté publicada en Google Cloud Console',
        '2. Asegúrate de que los dominios estén autorizados',
        '3. Los usuarios podrán conectar Google Calendar sin ser agregados como usuarios de prueba'
      ],
      next_steps: [
        'Publicar la aplicación en OAuth Consent Screen',
        'Agregar dominios autorizados: localhost, vercel.app',
        'Configurar variables de entorno en Vercel'
      ]
    });

  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
