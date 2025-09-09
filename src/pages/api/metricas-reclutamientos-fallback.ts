import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🚀 Iniciando API metricas-reclutamientos-fallback');
    console.log('🔧 Variables de entorno:', {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV
    });

    const { usuarioId, esAdmin, rol } = req.query;
    
    console.log('👤 Parámetros recibidos:', { usuarioId, esAdmin, rol });

    // Verificar si las variables de entorno están configuradas
    const hasSupabaseConfig = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!hasSupabaseConfig) {
      console.error('❌ Variables de entorno de Supabase no configuradas');
      return res.status(500).json({
        error: 'Configuración de Supabase faltante',
        details: 'Las variables NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no están configuradas en Vercel',
        instructions: [
          '1. Ve a tu proyecto en Vercel',
          '2. Ve a Settings > Environment Variables',
          '3. Agrega NEXT_PUBLIC_SUPABASE_URL con valor: https://eloncaptettdvrvwypji.supabase.co',
          '4. Agrega SUPABASE_SERVICE_ROLE_KEY con la clave de servicio de Supabase',
          '5. Haz redeploy del proyecto'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Si llegamos aquí, las variables están configuradas pero algo más está fallando
    return res.status(500).json({
      error: 'Error en la API de métricas',
      details: 'Las variables de entorno están configuradas pero la API está fallando',
      debug: {
        hasSupabaseConfig,
        usuarioId: usuarioId || 'undefined',
        esAdmin: esAdmin || 'undefined',
        rol: rol || 'undefined',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en métricas de reclutamientos fallback:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}
