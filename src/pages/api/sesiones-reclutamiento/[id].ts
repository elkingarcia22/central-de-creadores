import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';
import { simpleSyncCalendar } from '../../../lib/simple-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de sesión requerido' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getSesion(req, res, id);
      case 'PUT':
        return await updateSesion(req, res, id);
      case 'DELETE':
        return await deleteSesion(req, res, id);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API sesiones-reclutamiento/[id]:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getSesion(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    console.log('🔍 Obteniendo sesión:', id);
    
    // Primero probar una consulta simple
    const { data: sesion, error } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo sesión:', error);
      return res.status(404).json({ error: 'Sesión no encontrada', details: error.message });
    }

    console.log('✅ Sesión obtenida:', sesion);
    return res.status(200).json({ sesion });
  } catch (error) {
    console.error('Error en getSesion:', error);
    return res.status(500).json({ error: 'Error obteniendo sesión' });
  }
}

async function updateSesion(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    console.log('🔄 Actualizando sesión:', id);
    console.log('📝 Datos recibidos:', req.body);
    
    const updateData = req.body;
    
    // Validar que la sesión existe
    const { data: existingSesion, error: fetchError } = await supabaseServer
      .from('reclutamientos')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSesion) {
      console.error('Sesión no encontrada:', fetchError);
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Actualizar la sesión - mapear campos
    const mappedData = { ...updateData };
    if (mappedData.fecha_programada) {
      mappedData.fecha_sesion = mappedData.fecha_programada;
      delete mappedData.fecha_programada;
    }
    if (mappedData.duracion_minutos) {
      mappedData.duracion_sesion = mappedData.duracion_minutos;
      delete mappedData.duracion_minutos;
    }

    const { data: updatedSesion, error: updateError } = await supabaseServer
      .from('reclutamientos')
      .update(mappedData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error actualizando sesión:', updateError);
      return res.status(400).json({ error: 'Error actualizando sesión', details: updateError.message });
    }

    console.log('✅ Sesión actualizada:', updatedSesion);
    
    // Sincronizar con Google Calendar usando Simple Sync
    try {
      console.log('🔄 Iniciando sincronización con Google Calendar (Simple Sync)...');
      console.log('🔍 Datos para sincronización:', {
        userId: updatedSesion.reclutador_id,
        reclutamientoId: id,
        action: 'update',
        sesion: updatedSesion
      });
      
      const syncResult = await simpleSyncCalendar({
        userId: updatedSesion.reclutador_id,
        reclutamientoId: id,
        action: 'update',
        reclutamiento: updatedSesion // Pasar los datos completos del reclutamiento
      });
      console.log('📊 Resultado de sincronización Simple Sync:', syncResult);
    } catch (syncError) {
      console.error('❌ Error en sincronización Simple Sync:', syncError);
      // No fallar la operación por error de sincronización
    }
    
    return res.status(200).json({ sesion: updatedSesion });
  } catch (error) {
    console.error('Error en updateSesion:', error);
    return res.status(500).json({ error: 'Error actualizando sesión' });
  }
}

async function deleteSesion(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    console.log('🗑️ Eliminando sesión:', id);
    
    // Validar que la sesión existe y obtener el reclutador_id
    const { data: existingSesion, error: fetchError } = await supabaseServer
      .from('reclutamientos')
      .select('id, reclutador_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSesion) {
      console.error('Sesión no encontrada:', fetchError);
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Sincronizar eliminación con Google Calendar ANTES de eliminar de la base de datos
    try {
      console.log('🔄 Iniciando sincronización de eliminación con Google Calendar (Simple Sync)...');
      const syncResult = await simpleSyncCalendar({
        userId: existingSesion.reclutador_id || '', // Usar el reclutador_id de la sesión eliminada
        reclutamientoId: id,
        action: 'delete'
      });
      console.log('📊 Resultado de sincronización de eliminación Simple Sync:', syncResult);
    } catch (syncError) {
      console.error('❌ Error en sincronización de eliminación Simple Sync:', syncError);
      // No fallar la operación por error de sincronización
    }

    // Eliminar la sesión de la base de datos
    const { error: deleteError } = await supabaseServer
      .from('reclutamientos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error eliminando sesión:', deleteError);
      return res.status(400).json({ error: 'Error eliminando sesión', details: deleteError.message });
    }

    console.log('✅ Sesión eliminada:', id);
    
    return res.status(200).json({ message: 'Sesión eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteSesion:', error);
    return res.status(500).json({ error: 'Error eliminando sesión' });
  }
}
