import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { reclutamiento_id } = req.body;

    if (!reclutamiento_id) {
      return res.status(400).json({ error: 'reclutamiento_id es requerido' });
    }

    console.log('🔄 === SINCRONIZANDO HISTORIAL ===');
    console.log(`📋 Reclutamiento ID: ${reclutamiento_id}`);

    // Obtener información del reclutamiento
    const { data: reclutamiento, error: errorReclutamiento } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        participantes(id, empresa_id),
        participantes_internos(id)
      `)
      .eq('id', reclutamiento_id)
      .single();

    if (errorReclutamiento || !reclutamiento) {
      console.error('Error obteniendo reclutamiento:', errorReclutamiento);
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    console.log('✅ Reclutamiento encontrado:', reclutamiento.id);

    // Verificar si el estado es "Finalizado"
    const { data: estado, error: errorEstado } = await supabase
      .from('estado_agendamiento_cat')
      .select('nombre')
      .eq('id', reclutamiento.estado_agendamiento)
      .single();

    if (errorEstado) {
      console.error('Error obteniendo estado:', errorEstado);
      return res.status(500).json({ error: 'Error obteniendo estado' });
    }

    if (estado.nombre !== 'Finalizado') {
      console.log('⚠️  Reclutamiento no está finalizado, no se sincroniza');
      return res.status(200).json({ 
        success: true, 
        message: 'Reclutamiento no está finalizado',
        estado: estado.nombre 
      });
    }

    // Determinar si es participante externo o interno
    if (reclutamiento.participantes_id) {
      // Participante externo
      console.log('👤 Sincronizando participante externo...');
      
      const { error: errorInsert } = await supabase
        .from('historial_participacion_participantes')
        .insert({
          participante_id: reclutamiento.participantes_id,
          investigacion_id: reclutamiento.investigacion_id,
          reclutamiento_id: reclutamiento.id,
          empresa_id: reclutamiento.participantes?.empresa_id,
          fecha_participacion: reclutamiento.fecha_sesion,
          estado_sesion: 'completada',
          duracion_sesion: reclutamiento.duracion_sesion,
          creado_por: reclutamiento.creado_por
        })
        .select();

      if (errorInsert) {
        console.error('Error sincronizando historial participante externo:', errorInsert);
        return res.status(500).json({ error: 'Error sincronizando historial' });
      } else {
        console.log('✅ Historial de participante externo sincronizado');
      }
    } else if (reclutamiento.participantes_internos_id) {
      // Participante interno
      console.log('👤 Sincronizando participante interno...');
      
      const { error: errorInsert } = await supabase
        .from('historial_participacion_participantes_internos')
        .insert({
          participante_interno_id: reclutamiento.participantes_internos_id,
          investigacion_id: reclutamiento.investigacion_id,
          fecha_participacion: reclutamiento.fecha_sesion,
          estado_sesion: 'completada',
          duracion_minutos: reclutamiento.duracion_sesion,
          reclutador_id: reclutamiento.reclutador_id,
          observaciones: 'Sincronizado automáticamente'
        })
        .select();

      if (errorInsert) {
        console.error('Error sincronizando historial participante interno:', errorInsert);
        return res.status(500).json({ error: 'Error sincronizando historial' });
      } else {
        console.log('✅ Historial de participante interno sincronizado');
      }
    } else {
      console.error('❌ No se pudo determinar el tipo de participante');
      return res.status(400).json({ error: 'Tipo de participante no válido' });
    }

    console.log('✅ === SINCRONIZACIÓN COMPLETADA ===');

    return res.status(200).json({
      success: true,
      message: 'Historial sincronizado correctamente',
      reclutamiento_id,
      tipo_participante: reclutamiento.participantes_id ? 'externo' : 'interno'
    });

  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 