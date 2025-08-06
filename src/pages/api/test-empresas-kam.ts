import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔄 GET /api/test-empresas-kam - Iniciando prueba...');
      
      // Prueba 1: Consulta simple
      console.log('📡 Probando consulta simple...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('empresas')
        .select('id, nombre, kam_id')
        .order('nombre');

      console.log('📊 Consulta simple:', { 
        data: simpleData?.length || 0, 
        error: simpleError?.message || null 
      });

      // Prueba 2: Consulta con join
      console.log('📡 Probando consulta con join...');
      const { data: joinData, error: joinError } = await supabase
        .from('empresas')
        .select(`
          id, 
          nombre,
          kam_id,
          usuarios!empresas_kam_id_fkey (
            id,
            nombre,
            apellido,
            correo
          )
        `)
        .order('nombre');

      console.log('📊 Consulta con join:', { 
        data: joinData?.length || 0, 
        error: joinError?.message || null 
      });

      // Prueba 3: Verificar foreign key
      console.log('📡 Verificando foreign key...');
      const { data: fkData, error: fkError } = await supabase
        .from('empresas')
        .select('kam_id')
        .limit(1);

      console.log('📊 Foreign key test:', { 
        data: fkData, 
        error: fkError?.message || null 
      });

      // Respuesta con toda la información
      res.status(200).json({
        success: true,
        simple: {
          data: simpleData || [],
          error: simpleError?.message || null,
          count: simpleData?.length || 0
        },
        join: {
          data: joinData || [],
          error: joinError?.message || null,
          count: joinData?.length || 0
        },
        fk: {
          data: fkData || [],
          error: fkError?.message || null
        }
      });

    } catch (error) {
      console.error('❌ Error en GET /api/test-empresas-kam:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 