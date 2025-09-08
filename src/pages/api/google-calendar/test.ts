import { NextApiRequest, NextApiResponse } from 'next';
import { testGoogleCalendarConnection } from '../../../lib/google-calendar-simple';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const result = await testGoogleCalendarConnection();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Conexión con Google Calendar exitosa',
        calendars: result.calendars
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en test de Google Calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}
