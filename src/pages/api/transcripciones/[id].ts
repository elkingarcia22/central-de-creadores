import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de reclutamiento requerido' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getTranscripcion(req, res, id);
      case 'POST':
        return await createTranscripcion(req, res, id);
      case 'PUT':
        return await updateTranscripcion(req, res, id);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API transcripciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getTranscripcion(req: NextApiRequest, res: NextApiResponse, reclutamientoId: string) {
  try {
    console.log('🔍 Obteniendo transcripción para reclutamiento:', reclutamientoId);
    
    const { data: transcripcion, error } = await supabaseServer
      .from('transcripciones_sesiones')
      .select('*')
      .eq('reclutamiento_id', reclutamientoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error obteniendo transcripción:', error);
      return res.status(500).json({ error: 'Error obteniendo transcripción' });
    }

    console.log('✅ Transcripción obtenida:', transcripcion ? 'Sí' : 'No');
    return res.status(200).json({ transcripcion });
  } catch (error) {
    console.error('Error en getTranscripcion:', error);
    return res.status(500).json({ error: 'Error obteniendo transcripción' });
  }
}

async function createTranscripcion(req: NextApiRequest, res: NextApiResponse, reclutamientoId: string) {
  try {
    console.log('📝 Creando transcripción para reclutamiento:', reclutamientoId);
    console.log('📤 Datos recibidos:', req.body);
    
    const { meet_link, transcripcion_completa, transcripcion_por_segmentos, duracion_total, idioma_detectado } = req.body;

    if (!meet_link) {
      return res.status(400).json({ error: 'Enlace de Meet requerido' });
    }

    const { data: nuevaTranscripcion, error } = await supabaseServer
      .from('transcripciones_sesiones')
      .insert({
        reclutamiento_id: reclutamientoId,
        meet_link,
        transcripcion_completa,
        transcripcion_por_segmentos,
        duracion_total,
        idioma_detectado: idioma_detectado || 'es',
        estado: 'completado'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando transcripción:', error);
      return res.status(500).json({ error: 'Error creando transcripción' });
    }

    console.log('✅ Transcripción creada:', nuevaTranscripcion.id);
    return res.status(201).json({ transcripcion: nuevaTranscripcion });
  } catch (error) {
    console.error('Error en createTranscripcion:', error);
    return res.status(500).json({ error: 'Error creando transcripción' });
  }
}

async function updateTranscripcion(req: NextApiRequest, res: NextApiResponse, reclutamientoId: string) {
  try {
    console.log('🔄 Actualizando transcripción para reclutamiento:', reclutamientoId);
    console.log('📤 Datos recibidos:', req.body);
    
    const { transcripcion_completa, transcripcion_por_segmentos, duracion_total, estado } = req.body;

    const updateData: any = {};
    if (transcripcion_completa !== undefined) updateData.transcripcion_completa = transcripcion_completa;
    if (transcripcion_por_segmentos !== undefined) updateData.transcripcion_por_segmentos = transcripcion_por_segmentos;
    if (duracion_total !== undefined) updateData.duracion_total = duracion_total;
    if (estado !== undefined) updateData.estado = estado;
    if (estado === 'completado') updateData.fecha_fin = new Date().toISOString();

    const { data: transcripcionActualizada, error } = await supabaseServer
      .from('transcripciones_sesiones')
      .update(updateData)
      .eq('reclutamiento_id', reclutamientoId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando transcripción:', error);
      return res.status(500).json({ error: 'Error actualizando transcripción' });
    }

    console.log('✅ Transcripción actualizada:', transcripcionActualizada.id);
    return res.status(200).json({ transcripcion: transcripcionActualizada });
  } catch (error) {
    console.error('Error en updateTranscripcion:', error);
    return res.status(500).json({ error: 'Error actualizando transcripción' });
  }
}
