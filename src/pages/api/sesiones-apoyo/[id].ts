import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 API sesiones-apoyo/[id] llamada:', req.method, req.url);
  console.log('🔍 ID recibido:', req.query.id);
  
  if (req.method === 'DELETE') {
    return await handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 DELETE request recibido:', req.method, req.url);
  console.log('🔍 Query params:', req.query);
  
  const { id } = req.query;

  if (!id) {
    console.log('❌ ID no proporcionado');
    return res.status(400).json({ error: 'ID de sesión requerido' });
  }

  try {
    console.log('🗑️ Eliminando sesión de apoyo:', id);

    // Eliminar la sesión de apoyo directamente
    const { error: sesionError } = await supabase
      .from('sesiones_apoyo')
      .delete()
      .eq('id', id);

    if (sesionError) {
      console.error('Error eliminando sesión de apoyo:', sesionError);
      return res.status(500).json({ error: 'Error eliminando sesión de apoyo' });
    }

    console.log('✅ Sesión de apoyo eliminada exitosamente:', id);
    return res.status(200).json({ message: 'Sesión de apoyo eliminada exitosamente' });
  } catch (error) {
    console.error('Error en DELETE sesiones-apoyo:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
