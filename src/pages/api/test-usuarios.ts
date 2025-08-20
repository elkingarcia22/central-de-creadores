import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 TEST: Iniciando prueba de usuarios...');
    
    // Probar conexión básica
    console.log('🧪 TEST: Probando conexión a Supabase...');
    const testConnection = await supabase.from('usuarios').select('count').limit(1);
    console.log('🧪 TEST: Conexión:', testConnection.error ? 'ERROR' : 'OK');
    console.log('🧪 TEST: Error conexión:', testConnection.error);

    // Probar consulta simple
    console.log('🧪 TEST: Probando consulta simple...');
    const simpleQuery = await supabase.from('usuarios').select('id').limit(1);
    console.log('🧪 TEST: Query simple data:', simpleQuery.data);
    console.log('🧪 TEST: Query simple error:', simpleQuery.error);

    // Probar consulta completa
    console.log('🧪 TEST: Probando consulta completa...');
    const fullQuery = await supabase
      .from('usuarios')
      .select('id, nombre, correo, activo')
      .order('nombre');
    console.log('🧪 TEST: Query completa data count:', fullQuery.data?.length);
    console.log('🧪 TEST: Query completa error:', fullQuery.error);
    console.log('🧪 TEST: Query completa data sample:', fullQuery.data?.slice(0, 2));

    // Verificar el KAM específico
    console.log('🧪 TEST: Probando KAM específico...');
    const kamQuery = await supabase
      .from('usuarios')
      .select('id, nombre, correo, activo')
      .eq('id', '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6');
    console.log('🧪 TEST: KAM data:', kamQuery.data);
    console.log('🧪 TEST: KAM error:', kamQuery.error);

    return res.status(200).json({
      test: 'completed',
      connection: testConnection.error ? 'ERROR' : 'OK',
      simpleQuery: {
        data: simpleQuery.data,
        error: simpleQuery.error
      },
      fullQuery: {
        count: fullQuery.data?.length,
        error: fullQuery.error,
        sample: fullQuery.data?.slice(0, 2)
      },
      kamQuery: {
        data: kamQuery.data,
        error: kamQuery.error
      }
    });
  } catch (error) {
    console.error('🧪 TEST: Error general:', error);
    return res.status(500).json({ error: 'Error en test' });
  }
}
