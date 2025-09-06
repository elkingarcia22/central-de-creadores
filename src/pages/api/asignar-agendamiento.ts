import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

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
        .from('profiles')
        .select('id, full_name, email, avatar_url')
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

      // Verificar si el usuario existe en la tabla usuarios (para FK constraint)
      const { data: usuarioEnTabla, error: errorUsuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', responsable_id)
        .single();

      if (errorUsuario || !usuarioEnTabla) {
        console.log('⚠️ Usuario no encontrado en tabla usuarios, pero continuando...');
        console.log('ℹ️ El usuario será creado automáticamente por el sistema cuando sea necesario');
        // No intentamos crear el usuario aquí para evitar problemas de RLS
      }

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

      // Ejecutar lógica de actualización automática de investigaciones
      console.log('🔄 Ejecutando lógica de actualización automática...');
      try {
        // Obtener datos del libreto para calcular el estado
        const { data: libretoData } = await supabase
          .from('libretos_investigacion')
          .select('numero_participantes')
          .eq('investigacion_id', investigacion_id)
          .single();

        // Obtener participantes reclutados (solo los que tienen participantes asignados y NO están en "Pendiente de agendamiento")
        const { data: participantesData } = await supabase
          .from('reclutamientos')
          .select(`
            id, 
            participantes_id, 
            participantes_internos_id, 
            participantes_friend_family_id,
            estado_agendamiento,
            estado_agendamiento_cat!inner(nombre)
          `)
          .eq('investigacion_id', investigacion_id)
          .or('participantes_id.not.is.null,participantes_internos_id.not.is.null,participantes_friend_family_id.not.is.null')
          .neq('estado_agendamiento_cat.nombre', 'Pendiente de agendamiento');

        const participantes_reclutados = participantesData?.length || 0;
        const participantes_requeridos = libretoData?.numero_participantes || 0;

        // Calcular estado de reclutamiento
        let estado_reclutamiento_nombre = 'Pendiente';
        if (participantes_requeridos > 0) {
          if (participantes_reclutados === 0) {
            estado_reclutamiento_nombre = 'Pendiente';
          } else if (participantes_reclutados < participantes_requeridos) {
            estado_reclutamiento_nombre = 'En progreso';
          } else {
            estado_reclutamiento_nombre = 'Agendada';
          }
        }

        console.log(`📊 Estado calculado: ${estado_reclutamiento_nombre} (${participantes_reclutados}/${participantes_requeridos})`);

        // Actualizar estado de la investigación si es necesario
        let nuevoEstadoInvestigacion = null;
        
        if (estado_reclutamiento_nombre === 'Agendada') {
          nuevoEstadoInvestigacion = 'por_iniciar';
        } else if (estado_reclutamiento_nombre === 'En progreso') {
          nuevoEstadoInvestigacion = 'por_agendar';
        }

        if (nuevoEstadoInvestigacion) {
          const { error: errorUpdate } = await supabase
            .from('investigaciones')
            .update({ 
              estado: nuevoEstadoInvestigacion
            })
            .eq('id', investigacion_id);

          if (errorUpdate) {
            console.error('❌ Error actualizando estado de investigación:', errorUpdate);
          } else {
            console.log(`✅ Investigación actualizada a "${nuevoEstadoInvestigacion}"`);
          }
        } else {
          console.log('ℹ️ No se requiere actualización del estado de investigación');
        }
      } catch (error) {
        console.error('❌ Error en lógica de actualización automática:', error);
        // No fallar la respuesta principal por este error
      }

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