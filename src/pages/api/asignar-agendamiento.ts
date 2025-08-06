import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { investigacion_id, responsable_id } = req.body;

      console.log('🔍 Creando responsable_agendamiento:', {
        reclutamiento_id: investigacion_id,
        reclutador_id: responsable_id
      });

      // Verificar si el reclutador existe
      const { data: reclutador, error: errorReclutador } = await supabase
        .from('usuarios_con_roles')
        .select('id, full_name, email')
        .eq('id', responsable_id)
        .single();

      if (errorReclutador || !reclutador) {
        console.error('❌ Error obteniendo reclutador:', errorReclutador);
        return res.status(400).json({ error: 'Reclutador no encontrado' });
      }

      console.log('🔍 Reclutador encontrado:', {
        reclutador_encontrado: true,
        reclutador_data: reclutador
      });

      // Crear participante placeholder si no existe
      const { data: participantePlaceholder, error: errorParticipante } = await supabase
        .from('participantes')
        .select('id')
        .eq('nombre', 'Participante Placeholder')
        .single();

      let participanteId = null;
      if (errorParticipante) {
        // Crear participante placeholder
        const { data: nuevoParticipante, error: errorCrear } = await supabase
          .from('participantes')
          .insert({
            nombre: 'Participante Placeholder',
            rol_empresa_id: null,
            doleres_necesidades: 'Placeholder para agendamiento',
            descripción: 'Participante temporal creado automáticamente',
            kam_id: null,
            empresa_id: null,
            productos_relacionados: null,
            estado_participante: null,
            total_participaciones: 0,
            creado_por: responsable_id
          })
          .select()
          .single();

        if (errorCrear) {
          console.error('❌ Error creando participante placeholder:', errorCrear);
          return res.status(500).json({ error: 'Error creando participante placeholder' });
        }

        participanteId = nuevoParticipante.id;
      } else {
        participanteId = participantePlaceholder.id;
      }

      // Usar el estado de agendamiento "Pendiente de agendamiento" con UUID correcto
      const estadoAgendamiento = {
        id: 'd32b84d1-6209-41d9-8108-03588ca1f9b5',
        nombre: 'Pendiente de agendamiento',
        color: '#f59e0b'
      };

      // Crear el registro de reclutamiento
      const { data: reclutamiento, error: errorReclutamiento } = await supabase
        .from('reclutamientos')
        .insert({
          investigacion_id: investigacion_id,
          reclutador_id: responsable_id,
          participantes_id: participanteId, // Usar la variable corregida
          estado_agendamiento: estadoAgendamiento.id,
          fecha_asignado: new Date().toISOString(),
          creado_por: responsable_id
        })
        .select()
        .single();

      if (errorReclutamiento) {
        console.error('❌ Error creando reclutamiento:', errorReclutamiento);
        return res.status(500).json({ error: errorReclutamiento.message });
      }

      console.log('✅ Reclutamiento creado exitosamente:', reclutamiento);

      return res.status(201).json({
        success: true,
        reclutamiento,
        reclutador,
        estado_agendamiento: estadoAgendamiento
      });

    } catch (error) {
      console.error('❌ Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 