import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Test sesiones-apoyo llamada:', req.method, req.url);
  
  if (req.method === 'GET') {
    try {
      console.log('🧪 Probando GET sesiones-apoyo...');
      const { data, error } = await supabase
        .from('sesiones_apoyo')
        .select('*')
        .limit(5);

      if (error) {
        console.error('❌ Error en GET:', error);
        return res.status(500).json({ error: 'Error en GET', details: error });
      }

      console.log('✅ GET exitoso:', data?.length || 0, 'sesiones');
      return res.status(200).json({ 
        message: 'GET funcionando correctamente',
        count: data?.length || 0,
        data: data
      });
    } catch (error) {
      console.error('❌ Error en GET:', error);
      return res.status(500).json({ error: 'Error interno en GET', details: error.message });
    }
  }
  
  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    if (!id) {
      console.log('❌ ID no proporcionado');
      return res.status(400).json({ error: 'ID de sesión requerido' });
    }

    try {
      console.log('🧪 Probando DELETE sesiones-apoyo:', id);
      
      // Primero verificar si existe
      const { data: existing, error: checkError } = await supabase
        .from('sesiones_apoyo')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error verificando existencia:', checkError);
        return res.status(500).json({ error: 'Error verificando existencia', details: checkError });
      }

      if (!existing) {
        console.log('ℹ️ Sesión no encontrada');
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      // Eliminar
      const { error: deleteError } = await supabase
        .from('sesiones_apoyo')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Error en DELETE:', deleteError);
        return res.status(500).json({ error: 'Error en DELETE', details: deleteError });
      }

      console.log('✅ DELETE exitoso:', id);
      return res.status(200).json({ 
        message: 'DELETE funcionando correctamente',
        deletedId: id
      });
    } catch (error) {
      console.error('❌ Error en DELETE:', error);
      return res.status(500).json({ error: 'Error interno en DELETE', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Método no permitido' });
}
