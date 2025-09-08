import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Obtener todos los tokens de Google Calendar
    const { data: tokens, error } = await supabase
      .from('google_calendar_tokens')
      .select('*');

    if (error) {
      console.error('Error obteniendo tokens:', error);
      return res.status(500).json({ 
        error: 'Error obteniendo tokens',
        details: error.message 
      });
    }

    console.log('Tokens encontrados:', tokens?.length || 0);

    // Obtener información de usuarios
    const userIds = tokens?.map(t => t.user_id) || [];
    let users = [];
    
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, nombre, correo')
        .in('id', userIds);

      if (!usersError) {
        users = usersData || [];
      }
    }

    return res.status(200).json({
      success: true,
      total_tokens: tokens?.length || 0,
      tokens: tokens || [],
      users: users,
      message: tokens?.length === 0 ? 'No hay usuarios con Google Calendar conectado' : 'Usuarios con Google Calendar conectado encontrados'
    });

  } catch (error) {
    console.error('Error en check-tokens:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
