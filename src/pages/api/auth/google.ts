import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUrl } from '../../../lib/google-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    // Generar URL de autorización con el userId en el state
    const authUrl = getAuthUrl(userId as string);
    
    // Redirigir a Google OAuth
    res.redirect(authUrl);
    
  } catch (error) {
    console.error('Error generando URL de autorización:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
