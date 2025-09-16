import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 API sesiones-apoyo/[id] llamada:', req.method, req.url);
  console.log('🔍 ID recibido:', req.query.id);
  
  if (req.method === 'PUT') {
    return await handleUpdate(req, res);
  } else if (req.method === 'DELETE') {
    return await handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}

async function handleUpdate(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 PUT request recibido:', req.method, req.url);
  console.log('🔍 Body recibido:', req.body);
  
  const { id } = req.query;

  if (!id) {
    console.log('❌ ID no proporcionado');
    return res.status(400).json({ error: 'ID de sesión requerido' });
  }

  try {
    const {
      titulo,
      descripcion,
      fecha_programada,
      hora_sesion,
      duracion_minutos,
      moderador_id,
      observadores,
      objetivo_sesion,
      participantes_id,
      participantes_internos_id,
      participantes_friend_family_id,
      meet_link
    } = req.body;

    console.log('🔄 Actualizando sesión de apoyo:', id);
    console.log('📝 Datos recibidos:', {
      titulo,
      descripcion,
      fecha_programada,
      hora_sesion,
      duracion_minutos,
      moderador_id,
      observadores,
      objetivo_sesion,
      participantes_id,
      participantes_internos_id,
      participantes_friend_family_id,
      meet_link
    });

    // Preparar datos para actualizar
    const datosParaActualizar: any = {
      titulo,
      descripcion,
      fecha_programada: fecha_programada ? new Date(fecha_programada).toISOString() : null,
      hora_sesion,
      duracion_minutos: parseInt(duracion_minutos) || 60,
      moderador_id,
      observadores,
      objetivo_sesion,
      meet_link
    };

    // Agregar el participante según su tipo
    if (participantes_id) {
      datosParaActualizar.participantes_id = participantes_id;
    }
    if (participantes_internos_id) {
      datosParaActualizar.participantes_internos_id = participantes_internos_id;
    }
    if (participantes_friend_family_id) {
      datosParaActualizar.participantes_friend_family_id = participantes_friend_family_id;
    }

    console.log('📝 Datos para actualizar:', datosParaActualizar);

    // Actualizar la sesión de apoyo
    const { data: sesionActualizada, error: updateError } = await supabase
      .from('sesiones_apoyo')
      .update(datosParaActualizar)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Error actualizando sesión de apoyo:', updateError);
      return res.status(400).json({ 
        error: 'Error actualizando sesión de apoyo', 
        details: updateError.message 
      });
    }

    console.log('✅ Sesión de apoyo actualizada exitosamente:', sesionActualizada);

    return res.status(200).json({ 
      message: 'Sesión de apoyo actualizada exitosamente',
      sesion: sesionActualizada
    });

  } catch (error) {
    console.error('❌ Error en handleUpdate:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
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
