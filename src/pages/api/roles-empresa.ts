import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Obteniendo roles de empresa desde Supabase...');
      
      const { data, error } = await supabase
        .from('roles_empresa')
        .select('id, nombre')
        .order('nombre');

      if (error) {
        console.error('❌ Error obteniendo roles de empresa:', error);
        return res.status(500).json({ 
          error: 'Error obteniendo roles de empresa',
          details: error.message 
        });
      }

      console.log('✅ Roles de empresa obtenidos exitosamente:', data?.length || 0, 'roles');
      
      res.status(200).json(data || []);
    } catch (error) {
      console.error('💥 Error inesperado obteniendo roles de empresa:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 