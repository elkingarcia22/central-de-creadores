import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    switch (method) {
      case 'GET':
        return await obtenerDolores(req, res, id);
      case 'POST':
        return await crearDolor(req, res, id);
      case 'PUT':
        return await actualizarDolor(req, res);
      case 'PATCH':
        return await actualizarEstadoDolor(req, res);
      case 'DELETE':
        return await eliminarDolor(req, res);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('❌ Error en la API de dolores:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Obtener dolores de un participante
async function obtenerDolores(req: NextApiRequest, res: NextApiResponse, participanteId: string) {
  try {
    console.log('🔍 Obteniendo dolores para participante:', participanteId);

    const { data: dolores, error } = await supabaseServer
      .from('vista_dolores_participantes')
      .select('*')
      .eq('participante_id', participanteId)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo dolores:', error);
      return res.status(500).json({ error: 'Error al obtener dolores' });
    }

    console.log('✅ Dolores obtenidos:', dolores?.length || 0);

    return res.status(200).json(dolores || []);
  } catch (error) {
    console.error('❌ Error obteniendo dolores:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Crear un nuevo dolor
async function crearDolor(req: NextApiRequest, res: NextApiResponse, participanteId: string) {
  try {
    const { categoria_id, titulo, descripcion, severidad, investigacion_relacionada_id, sesion_relacionada_id } = req.body;

    if (!categoria_id || !titulo) {
      return res.status(400).json({ error: 'Categoría y título son requeridos' });
    }

    console.log('🔍 Creando dolor para participante:', participanteId);

    const { data: nuevoDolor, error } = await supabaseServer
      .from('dolores_participantes')
      .insert({
        participante_id: participanteId,
        categoria_id,
        titulo,
        descripcion,
        severidad: severidad || 'media',
        investigacion_relacionada_id,
        sesion_relacionada_id,
        creado_por: req.headers['user-id'] as string // Asumiendo que se pasa en headers
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando dolor:', error);
      return res.status(500).json({ error: 'Error al crear dolor' });
    }

    console.log('✅ Dolor creado:', nuevoDolor.id);

    return res.status(201).json(nuevoDolor);
  } catch (error) {
    console.error('❌ Error creando dolor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Actualizar un dolor existente
async function actualizarDolor(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, categoria_id, titulo, descripcion, severidad, estado, fecha_resolucion } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID del dolor es requerido' });
    }

    console.log('🔍 Actualizando dolor:', id);

    const updateData: any = {};
    if (categoria_id) updateData.categoria_id = categoria_id;
    if (titulo) updateData.titulo = titulo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (severidad) updateData.severidad = severidad;
    if (estado) updateData.estado = estado;
    if (fecha_resolucion) updateData.fecha_resolucion = fecha_resolucion;

    const { data: dolorActualizado, error } = await supabaseServer
      .from('dolores_participantes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando dolor:', error);
      return res.status(500).json({ error: 'Error al actualizar dolor' });
    }

    console.log('✅ Dolor actualizado:', dolorActualizado.id);

    return res.status(200).json(dolorActualizado);
  } catch (error) {
    console.error('❌ Error actualizando dolor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Eliminar un dolor
async function eliminarDolor(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID del dolor es requerido' });
    }

    console.log('🔍 Eliminando dolor:', id);

    const { error } = await supabaseServer
      .from('dolores_participantes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando dolor:', error);
      return res.status(500).json({ error: 'Error al eliminar dolor' });
    }

    console.log('✅ Dolor eliminado:', id);

    return res.status(200).json({ message: 'Dolor eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando dolor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Actualizar solo el estado de un dolor
async function actualizarEstadoDolor(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { estado } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID del dolor es requerido' });
    }

    if (!estado || !['activo', 'resuelto', 'archivado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado válido es requerido (activo, resuelto, archivado)' });
    }

    console.log('🔍 Actualizando estado del dolor:', id, 'a:', estado);

    const updateData: any = {
      estado,
      fecha_actualizacion: new Date().toISOString()
    };

    // Si se está marcando como resuelto, agregar fecha de resolución
    if (estado === 'resuelto') {
      updateData.fecha_resolucion = new Date().toISOString();
    }

    const { data: dolorActualizado, error } = await supabaseServer
      .from('dolores_participantes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando estado del dolor:', error);
      return res.status(500).json({ error: 'Error al actualizar estado del dolor' });
    }

    console.log('✅ Estado del dolor actualizado:', dolorActualizado.id, 'a:', estado);

    return res.status(200).json(dolorActualizado);
  } catch (error) {
    console.error('❌ Error actualizando estado del dolor:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
