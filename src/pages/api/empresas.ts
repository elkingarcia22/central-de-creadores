import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔄 GET /api/empresas - Iniciando consulta...');
      
      // Primero probar con la consulta simple para verificar que funciona
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nombre, kam_id')
        .order('nombre');

      console.log('📊 Resultado de consulta:', { 
        data: data?.length || 0, 
        error: error ? error.message : null,
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data)
      });

      if (error) {
        console.error('❌ Error obteniendo empresas:', error);
        return res.status(500).json({ error: 'Error al obtener empresas', details: error.message });
      }

      // Si no hay datos, devolver array vacío
      if (!data || data.length === 0) {
        console.log('⚠️ No hay empresas en la base de datos');
        return res.status(200).json([]);
      }

      console.log('✅ Empresas obtenidas exitosamente:', data?.length || 0, 'registros');
      res.status(200).json(data || []);
    } catch (error) {
      console.error('❌ Error en GET /api/empresas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 