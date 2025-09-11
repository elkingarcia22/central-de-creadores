import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log('🧹 Limpiando tokens de Google Calendar para usuario:', userId);

    // Eliminar tokens existentes del usuario
    const { error } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error limpiando tokens:', error);
      return res.status(500).json({ 
        error: 'Error limpiando tokens',
        details: error.message 
      });
    }

    console.log('✅ Tokens limpiados exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Tokens de Google Calendar eliminados exitosamente',
      userId: userId
    });

  } catch (error) {
    console.error('❌ Error limpiando tokens:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
