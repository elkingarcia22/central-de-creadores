import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    if (!supabase) {
      console.error('❌ Cliente de Supabase no disponible');
      return res.status(500).json({ error: 'Cliente de Supabase no configurado' });
    }

    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID de reclutamiento requerido' });
    }

    console.log('🔍 Obteniendo reclutamiento individual:', id);

    // Obtener el reclutamiento básico
    const { data: reclutamiento, error } = await supabase
      .from('reclutamientos')
      .select('id, investigacion_id, participantes_id, estado_agendamiento, reclutador_id, fecha_sesion')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo reclutamiento:', error);
      return res.status(500).json({ error: 'Error obteniendo reclutamiento', details: error });
    }

    if (!reclutamiento) {
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    // Obtener información de la investigación
    const { data: investigacion } = await supabase
      .from('investigaciones')
      .select('nombre, estado')
      .eq('id', reclutamiento.investigacion_id)
      .single();

    // Obtener información del participante
    let participante = null;
    if (reclutamiento.participantes_id) {
      const { data: participanteData } = await supabase
        .from('participantes')
        .select('nombre')
        .eq('id', reclutamiento.participantes_id)
        .single();
      participante = participanteData;
    }

    // Obtener información del estado de agendamiento
    const { data: estadoAgendamiento } = await supabase
      .from('estado_agendamiento_cat')
      .select('nombre, color')
      .eq('id', reclutamiento.estado_agendamiento)
      .single();

    // Formatear la respuesta
    const reclutamientoFormateado = {
      id: reclutamiento.id,
      investigacion_id: reclutamiento.investigacion_id,
      participantes_id: reclutamiento.participantes_id,
      estado_agendamiento: reclutamiento.estado_agendamiento,
      reclutador_id: reclutamiento.reclutador_id,
      fecha_sesion: reclutamiento.fecha_sesion,
      investigacion_nombre: investigacion?.nombre || 'Sin nombre',
      participante_nombre: participante?.nombre || 'Sin participante',
      estado_agendamiento_nombre: estadoAgendamiento?.nombre || 'Sin estado',
      estado_agendamiento_color: estadoAgendamiento?.color || '#6B7280'
    };

    console.log('✅ Reclutamiento encontrado:', reclutamientoFormateado);

    return res.status(200).json({
      reclutamiento: reclutamientoFormateado
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
}
