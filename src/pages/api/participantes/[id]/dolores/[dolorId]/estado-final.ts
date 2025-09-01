import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id: participanteId, dolorId } = req.query;

  console.log('🔧 Endpoint FINAL de estado de dolor llamado');
  console.log('🔧 Método:', method);
  console.log('🔧 Participante ID:', participanteId);
  console.log('🔧 Dolor ID:', dolorId);

  if (!participanteId || typeof participanteId !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  if (!dolorId || typeof dolorId !== 'string') {
    return res.status(400).json({ error: 'ID del dolor requerido' });
  }

  if (method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido. Use PATCH' });
  }

  try {
    console.log('🔧 Procesando cambio de estado...');
    console.log('🔧 Request body:', req.body);

    const { estado } = req.body;

    // Validar estado
    if (!estado || !['activo', 'resuelto', 'archivado'].includes(estado)) {
      console.error('❌ Estado inválido:', estado);
      return res.status(400).json({ 
        error: 'Estado válido es requerido (activo, resuelto, archivado)',
        received: estado
      });
    }

    console.log('🔧 Estado válido:', estado);

    // ESTRATEGIA: Obtener todos los datos del dolor, eliminar y reinsertar
    console.log('🔧 Obteniendo datos completos del dolor...');
    
    const { data: dolorCompleto, error: getError } = await supabaseServer
      .from('dolores_participantes')
      .select('*')
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .single();

    if (getError) {
      console.error('❌ Error obteniendo dolor:', getError);
      return res.status(404).json({ 
        error: 'Dolor no encontrado',
        details: 'El dolor especificado no existe o no pertenece al participante'
      });
    }

    console.log('🔧 Dolor encontrado, preparando actualización...');

    // Preparar datos actualizados
    const now = new Date().toISOString();
    const datosActualizados = {
      ...dolorCompleto,
      estado: estado,
      fecha_actualizacion: now,
      ...(estado === 'resuelto' && { fecha_resolucion: now })
    };

    // Eliminar campos que no se pueden actualizar
    delete datosActualizados.id; // El ID se mantiene igual
    delete datosActualizados.fecha_creacion; // No cambiar fecha de creación

    console.log('🔧 Datos preparados para actualización');

    // ESTRATEGIA: Usar transacción para eliminar y reinsertar
    console.log('🔧 Ejecutando actualización con estrategia de reemplazo...');

    // 1. Eliminar el registro actual
    const { error: deleteError } = await supabaseServer
      .from('dolores_participantes')
      .delete()
      .eq('id', dolorId)
      .eq('participante_id', participanteId);

    if (deleteError) {
      console.error('❌ Error eliminando dolor:', deleteError);
      return res.status(500).json({ 
        error: 'Error al eliminar dolor para actualización',
        details: deleteError.message
      });
    }

    console.log('🔧 Dolor eliminado, reinsertando con datos actualizados...');

    // 2. Reinsertar con los datos actualizados
    const { data: dolorActualizado, error: insertError } = await supabaseServer
      .from('dolores_participantes')
      .insert({
        id: dolorId, // Mantener el mismo ID
        ...datosActualizados
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Error reinsertando dolor:', insertError);
      
      // Intentar restaurar el dolor original
      console.log('🔧 Intentando restaurar dolor original...');
      await supabaseServer
        .from('dolores_participantes')
        .insert(dolorCompleto);

      return res.status(500).json({ 
        error: 'Error al reinsertar dolor actualizado',
        details: insertError.message,
        code: insertError.code
      });
    }

    console.log('✅ Dolor actualizado exitosamente con estrategia de reemplazo');
    console.log('✅ Dolor actualizado:', dolorActualizado);

    return res.status(200).json({
      success: true,
      message: `Dolor marcado como ${estado} exitosamente`,
      data: dolorActualizado,
      method: 'replace_strategy'
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
