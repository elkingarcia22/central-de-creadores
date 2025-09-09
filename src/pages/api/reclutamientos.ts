import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';
import { autoSyncCalendar } from '../../lib/auto-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { participantes_id } = req.query;

      if (!participantes_id) {
        return res.status(400).json({ error: 'Se requiere participantes_id' });
      }

      const { data, error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_id', participantes_id);

      if (error) {
        console.error('Error buscando reclutamientos:', error);
        return res.status(500).json({ error: error.message });
      }

      console.log('✅ Reclutamientos encontrados:', data);
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error en la API GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('📥 Datos recibidos en POST:', req.body);
      
      const {
        investigacion_id,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        reclutador_id,
        fecha_sesion,
        hora_sesion,
        duracion_sesion,
        estado_agendamiento,
        meet_link
      } = req.body;

      console.log('🔍 Datos extraídos:', {
        investigacion_id,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        reclutador_id,
        fecha_sesion,
        hora_sesion,
        duracion_sesion,
        duracion_sesion_type: typeof duracion_sesion,
        estado_agendamiento,
        meet_link
      });

      // Preparar datos para insertar
      const datosParaInsertar: any = {
        investigacion_id,
        updated_at: new Date().toISOString()
      };

      // Solo incluir campos que están definidos y no están vacíos
      if (participantes_id !== undefined && participantes_id !== '') datosParaInsertar.participantes_id = participantes_id;
      if (participantes_internos_id !== undefined && participantes_internos_id !== '') datosParaInsertar.participantes_internos_id = participantes_internos_id;
      if (participantes_friend_family_id !== undefined && participantes_friend_family_id !== '') datosParaInsertar.participantes_friend_family_id = participantes_friend_family_id;
      if (reclutador_id !== undefined && reclutador_id !== '') datosParaInsertar.reclutador_id = reclutador_id;
      if (fecha_sesion !== undefined && fecha_sesion !== '') datosParaInsertar.fecha_sesion = fecha_sesion;
      if (hora_sesion !== undefined && hora_sesion !== '') datosParaInsertar.hora_sesion = hora_sesion;
      if (duracion_sesion !== undefined && duracion_sesion !== '') datosParaInsertar.duracion_sesion = parseInt(duracion_sesion);
      if (estado_agendamiento !== undefined && estado_agendamiento !== '') datosParaInsertar.estado_agendamiento = estado_agendamiento;
      if (meet_link !== undefined && meet_link !== '') datosParaInsertar.meet_link = meet_link;

      console.log('📤 Datos para insertar:', datosParaInsertar);

      const { data, error } = await supabase
        .from('reclutamientos')
        .insert(datosParaInsertar)
        .select()
        .single();

      if (error) {
        console.error('Error creando reclutamiento:', error);
        return res.status(500).json({ error: error.message });
      }

      console.log('✅ Reclutamiento creado exitosamente:', data);

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

      // Sincronización automática con Google Calendar
      console.log('🔄 Iniciando sincronización automática con Google Calendar...');
      try {
        // Obtener el usuario que está creando el reclutamiento
        // Por ahora usamos el reclutador_id, pero podríamos obtenerlo del token de autenticación
        const userId = reclutador_id;
        
        if (userId) {
          console.log('🔄 Iniciando sincronización con Google Calendar:', {
            userId,
            reclutamientoId: data.id,
            action: 'create'
          });
          
          const syncResult = await autoSyncCalendar({
            userId,
            reclutamientoId: data.id,
            action: 'create'
          });
          
          console.log('📅 Resultado de sincronización:', syncResult);
          
          if (syncResult.success) {
            console.log('✅ Sincronización automática exitosa');
          } else {
            console.log('⚠️ Sincronización automática falló:', syncResult.reason);
          }
        } else {
          console.log('⚠️ No se pudo determinar el usuario para sincronización automática');
        }
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
        // No fallar la respuesta principal por este error
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}