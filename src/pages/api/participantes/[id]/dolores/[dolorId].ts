import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id: participanteId, dolorId } = req.query;

  if (!participanteId || typeof participanteId !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  if (!dolorId || typeof dolorId !== 'string') {
    return res.status(400).json({ error: 'ID del dolor requerido' });
  }

  try {
    switch (method) {
      case 'GET':
        return await obtenerDolor(req, res, participanteId, dolorId);
      case 'PUT':
        return await actualizarDolor(req, res, participanteId, dolorId);
      case 'PATCH':
        return await actualizarEstadoDolor(req, res, participanteId, dolorId);
      case 'DELETE':
        return await eliminarDolor(req, res, participanteId, dolorId);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('❌ Error en la API de dolor individual:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Obtener un dolor específico
async function obtenerDolor(req: NextApiRequest, res: NextApiResponse, participanteId: string, dolorId: string) {
  try {
    console.log('🔍 Obteniendo dolor:', dolorId, 'para participante:', participanteId);

    const { data: dolor, error } = await supabaseServer
      .from('vista_dolores_participantes')
      .select('*')
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo dolor:', error);
      return res.status(404).json({ error: 'Dolor no encontrado' });
    }

    console.log('✅ Dolor obtenido:', dolor.id);
    return res.status(200).json(dolor);
  } catch (error) {
    console.error('❌ Error obteniendo dolor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Actualizar un dolor existente
async function actualizarDolor(req: NextApiRequest, res: NextApiResponse, participanteId: string, dolorId: string) {
  try {
    console.log('🔍 Iniciando actualización de dolor');
    console.log('🔍 Participante ID:', participanteId);
    console.log('🔍 Dolor ID:', dolorId);
    console.log('🔍 Request body:', req.body);

    const { categoria_id, titulo, descripcion, severidad, estado, fecha_resolucion } = req.body;

    console.log('🔍 Datos extraídos del body:', {
      categoria_id,
      titulo,
      descripcion,
      severidad,
      estado,
      fecha_resolucion
    });

    const updateData: any = {};
    if (categoria_id) updateData.categoria_id = categoria_id;
    if (titulo) updateData.titulo = titulo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (severidad) updateData.severidad = severidad;
    if (estado) updateData.estado = estado;
    if (fecha_resolucion) updateData.fecha_resolucion = fecha_resolucion;
    
    // Agregar fecha de actualización automática
    updateData.fecha_actualizacion = new Date().toISOString();

    console.log('🔍 Datos a actualizar en la base de datos:', updateData);
    console.log('🔍 Ejecutando query de Supabase...');
    console.log('🔍 Tabla: dolores_participantes');
    console.log('🔍 ID del dolor:', dolorId);
    console.log('🔍 ID del participante:', participanteId);

    const { data: dolorActualizado, error } = await supabaseServer
      .from('dolores_participantes')
      .update(updateData)
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando dolor:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Error al actualizar dolor',
        details: error.message || 'Error desconocido'
      });
    }

    console.log('✅ Dolor actualizado exitosamente');
    console.log('✅ Dolor actualizado:', dolorActualizado.id);
    return res.status(200).json(dolorActualizado);
  } catch (error) {
    console.error('❌ Error inesperado actualizando dolor:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// Actualizar solo el estado de un dolor
async function actualizarEstadoDolor(req: NextApiRequest, res: NextApiResponse, participanteId: string, dolorId: string) {
  try {
    console.log('🔍 Iniciando actualización de estado del dolor');
    console.log('🔍 Participante ID:', participanteId);
    console.log('🔍 Dolor ID:', dolorId);
    console.log('🔍 Request body:', req.body);

    const { estado } = req.body;

    if (!estado || !['activo', 'resuelto', 'archivado'].includes(estado)) {
      console.error('❌ Estado inválido:', estado);
      return res.status(400).json({ error: 'Estado válido es requerido (activo, resuelto, archivado)' });
    }

    console.log('🔍 Estado válido recibido:', estado);

    // Primero verificar que el dolor existe y pertenece al participante
    console.log('🔍 Verificando existencia del dolor...');
    const { data: dolorExistente, error: checkError } = await supabaseServer
      .from('dolores_participantes')
      .select('id, estado')
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .single();

    if (checkError) {
      console.error('❌ Error verificando dolor:', checkError);
      return res.status(404).json({ error: 'Dolor no encontrado o no pertenece al participante' });
    }

    if (!dolorExistente) {
      console.error('❌ Dolor no encontrado');
      return res.status(404).json({ error: 'Dolor no encontrado' });
    }

    console.log('🔍 Dolor encontrado, estado actual:', dolorExistente.estado);

    const updateData: any = {
      estado,
      fecha_actualizacion: new Date().toISOString()
    };

    // Si se está marcando como resuelto, agregar fecha de resolución
    if (estado === 'resuelto') {
      updateData.fecha_resolucion = new Date().toISOString();
    }

    console.log('🔍 Datos a actualizar:', updateData);

    const { data: dolorActualizado, error } = await supabaseServer
      .from('dolores_participantes')
      .update(updateData)
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando estado del dolor:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Error al actualizar estado del dolor',
        details: error.message || 'Error desconocido'
      });
    }

    console.log('✅ Estado del dolor actualizado exitosamente');
    console.log('✅ Dolor actualizado:', dolorActualizado.id, 'a:', estado);
    
    return res.status(200).json(dolorActualizado);
  } catch (error) {
    console.error('❌ Error inesperado actualizando estado del dolor:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// Eliminar un dolor
async function eliminarDolor(req: NextApiRequest, res: NextApiResponse, participanteId: string, dolorId: string) {
  try {
    console.log('🔍 Eliminando dolor:', dolorId, 'del participante:', participanteId);

    // Verificar que el dolor pertenece al participante antes de eliminarlo
    const { data: dolor, error: checkError } = await supabaseServer
      .from('dolores_participantes')
      .select('id')
      .eq('id', dolorId)
      .eq('participante_id', participanteId)
      .single();

    if (checkError || !dolor) {
      console.error('❌ Dolor no encontrado o no pertenece al participante');
      return res.status(404).json({ error: 'Dolor no encontrado' });
    }

    const { error } = await supabaseServer
      .from('dolores_participantes')
      .delete()
      .eq('id', dolorId)
      .eq('participante_id', participanteId);

    if (error) {
      console.error('❌ Error eliminando dolor:', error);
      return res.status(500).json({ error: 'Error al eliminar dolor' });
    }

    console.log('✅ Dolor eliminado:', dolorId);
    return res.status(200).json({ message: 'Dolor eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando dolor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
