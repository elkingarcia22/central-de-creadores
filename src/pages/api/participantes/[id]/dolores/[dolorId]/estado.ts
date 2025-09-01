import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id: participanteId, dolorId } = req.query;

  console.log('🔍 Endpoint de estado de dolor llamado');
  console.log('🔍 Método:', method);
  console.log('🔍 Participante ID:', participanteId);
  console.log('🔍 Dolor ID:', dolorId);

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
    console.log('🔍 Procesando cambio de estado...');
    console.log('🔍 Request body:', req.body);

    const { estado } = req.body;

    // Validar estado
    if (!estado || !['activo', 'resuelto', 'archivado'].includes(estado)) {
      console.error('❌ Estado inválido:', estado);
      return res.status(400).json({ 
        error: 'Estado válido es requerido (activo, resuelto, archivado)',
        received: estado
      });
    }

    console.log('🔍 Estado válido:', estado);

    // Preparar datos de actualización
    const updateData: any = {
      estado: estado,
      fecha_actualizacion: new Date().toISOString()
    };

    // Agregar fecha de resolución si se está marcando como resuelto
    if (estado === 'resuelto') {
      updateData.fecha_resolucion = new Date().toISOString();
    }

    console.log('🔍 Datos a actualizar:', updateData);

    // Intentar actualización directa sin trigger problemático
    console.log('🔍 Ejecutando actualización...');
    
    // Primero verificar que el dolor existe
    const { data: dolorExistente, error: checkError } = await supabaseServer
      .from('dolores_participantes')
      .select('id, estado, fecha_actualizacion')
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .single();

    if (checkError) {
      console.error('❌ Error verificando dolor:', checkError);
      return res.status(404).json({ 
        error: 'Dolor no encontrado',
        details: 'El dolor especificado no existe o no pertenece al participante'
      });
    }

    console.log('🔍 Dolor encontrado, estado actual:', dolorExistente.estado);

    // Actualizar sin usar el trigger problemático
    const { data: dolorActualizado, error } = await supabaseServer
      .from('dolores_participantes')
      .update(updateData)
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .select('id, participante_id, categoria_id, titulo, descripcion, severidad, estado, fecha_creacion, fecha_resolucion, fecha_actualizacion')
      .single();

    if (error) {
      console.error('❌ Error en Supabase:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Intentar obtener más información sobre el error
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Dolor no encontrado',
          details: 'El dolor especificado no existe o no pertenece al participante'
        });
      }
      
      if (error.code === '42501') {
        return res.status(403).json({ 
          error: 'Permisos insuficientes',
          details: 'No tienes permisos para actualizar este dolor'
        });
      }

      return res.status(500).json({ 
        error: 'Error al actualizar estado del dolor',
        details: error.message || 'Error desconocido de Supabase',
        code: error.code
      });
    }

    if (!dolorActualizado) {
      console.error('❌ No se encontró el dolor después de la actualización');
      return res.status(404).json({ 
        error: 'Dolor no encontrado después de la actualización'
      });
    }

    console.log('✅ Estado actualizado exitosamente');
    console.log('✅ Dolor actualizado:', dolorActualizado);

    return res.status(200).json({
      success: true,
      message: `Dolor marcado como ${estado} exitosamente`,
      data: dolorActualizado
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
