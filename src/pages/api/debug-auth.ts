import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar variables de entorno
    const envCheck = {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };

    // Verificar tokens en la base de datos
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Verificar usuarios en la base de datos
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('id, email, nombre')
      .order('created_at', { ascending: false })
      .limit(5);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      tokens: {
        data: tokens,
        error: tokensError,
        count: tokens?.length || 0
      },
      users: {
        data: users,
        error: usersError,
        count: users?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error en debug-auth:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
