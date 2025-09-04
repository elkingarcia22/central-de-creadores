import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  console.log('🔍 API reclutamiento-actual - ID participante:', id);
  console.log('🔍 Variables de entorno:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Existe' : '❌ No existe');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Existe' : '❌ No existe');

  try {
    // PASO 1: Verificar que el participante existe en todas las tablas posibles
    console.log('🔍 PASO 1: Verificando participante en todas las tablas...');
    
    let participante = null;
    let tipoParticipante = 'no_encontrado';
    
    // Buscar en participantes (externos)
    const { data: participanteExterno, error: errorExterno } = await supabase
      .from('participantes')
      .select('id, nombre, tipo')
      .eq('id', id)
      .single();
    
    if (!errorExterno && participanteExterno) {
      participante = participanteExterno;
      tipoParticipante = 'externo';
      console.log('✅ Participante externo encontrado:', participante);
    } else {
      // Buscar en participantes_internos
      const { data: participanteInterno, error: errorInterno } = await supabase
        .from('participantes_internos')
        .select('id, nombre')
        .eq('id', id)
        .single();
      
      if (!errorInterno && participanteInterno) {
        participante = participanteInterno;
        tipoParticipante = 'interno';
        console.log('✅ Participante interno encontrado:', participante);
      } else {
        // Buscar en participantes_friend_family
        const { data: participanteFriendFamily, error: errorFriendFamily } = await supabase
          .from('participantes_friend_family')
          .select('id, nombre')
          .eq('id', id)
          .single();
        
        if (!errorFriendFamily && participanteFriendFamily) {
          participante = participanteFriendFamily;
          tipoParticipante = 'friend_family';
          console.log('✅ Participante friend & family encontrado:', participante);
        }
      }
    }
    
    if (!participante) {
      console.error('❌ Participante no encontrado en ninguna tabla');
      return res.status(404).json({ error: 'Participante no encontrado' });
    }
    
    console.log('✅ Participante encontrado:', participante, 'Tipo:', tipoParticipante);

    // PASO 2: Buscar reclutamientos en todas las columnas posibles según el tipo
    console.log('🔍 PASO 2: Buscando reclutamientos según tipo:', tipoParticipante);
    
    let reclutamientos = [];
    let reclutamientosError = null;
    
    if (tipoParticipante === 'externo') {
      // Para externos, buscar en participantes_id
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    } else if (tipoParticipante === 'interno') {
      // Para internos, buscar en participantes_internos_id
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_internos_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    } else if (tipoParticipante === 'friend_family') {
      // Para friend & family, buscar en participantes_friend_family_id
      const { data: data, error: error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_friend_family_id', id);
      
      reclutamientos = data || [];
      reclutamientosError = error;
    }

    if (reclutamientosError) {
      console.error('❌ Error consultando reclutamientos:', reclutamientosError);
      return res.status(500).json({ error: 'Error consultando reclutamientos' });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos);

    if (!reclutamientos || reclutamientos.length === 0) {
      console.log('⚠️ No hay reclutamientos para este participante. Devolviendo datos básicos...');
      
      // Para participantes sin reclutamientos, devolver datos básicos
      const participanteBasico = {
        id: participante.id,
        nombre: participante.nombre,
        descripcion: 'Sin descripción',
        fecha_inicio: null,
        fecha_sesion: null,
        duracion_sesion: 0,
        estado: 'Sin estado',
        estado_reclutamiento_nombre: 'Sin estado',
        responsable: 'Sin responsable',
        implementador: 'Sin implementador',
        tipo_investigacion: 'Sin tipo',
        fecha_asignado: null,
        estado_agendamiento: null,
        reclutador_id: null,
        creado_por: null,
        tipo_participante: tipoParticipante,
        sin_reclutamientos: true
      };
      
      return res.status(200).json({
        reclutamiento: participanteBasico
      });
    }

            // PASO 3: Tomar el más reciente, priorizando por fecha y tipo
            let reclutamiento = reclutamientos[0];
            
            // Si hay múltiples reclutamientos, ordenar por fecha y priorizar tipo_participante
            if (reclutamientos.length > 1) {
              console.log('🔍 Múltiples reclutamientos encontrados, ordenando por prioridad...');
              
              // LÓGICA DIFERENCIADA POR TIPO DE PARTICIPANTE
              if (tipoParticipante === 'friend_family') {
                // Para FRIEND & FAMILY: NO ordenar por fecha, tomar el PRIMERO
                console.log('🔍 Participante Friend & Family: tomando el primer reclutamiento sin ordenar por fecha');
                reclutamiento = reclutamientos[0];
              } else {
                // Para EXTERNOS e INTERNOS: mantener lógica de ordenamiento por fecha
                console.log('🔍 Participante Externo/Interno: ordenando por fecha y tipo...');
                
                // Ordenar: primero por tipo_participante (externo > null), luego por fecha (más reciente)
                const reclutamientosOrdenados = reclutamientos.sort((a, b) => {
                  // Prioridad 1: tipo_participante (externo primero)
                  const tipoA = a.tipo_participante === 'externo' ? 1 : 0;
                  const tipoB = b.tipo_participante === 'externo' ? 1 : 0;
                  
                  if (tipoA !== tipoB) {
                    return tipoB - tipoA; // externo primero
                  }
                  
                  // Prioridad 2: fecha (más reciente primero)
                  const fechaA = new Date(a.fecha_asignado || a.updated_at || 0);
                  const fechaB = new Date(b.fecha_asignado || b.updated_at || 0);
                  return fechaB.getTime() - fechaA.getTime();
                });
                
                reclutamiento = reclutamientosOrdenados[0];
                console.log('🔍 Reclutamientos ordenados por prioridad:', reclutamientosOrdenados.map(r => ({
                  id: r.id,
                  tipo: r.tipo_participante,
                  fecha: r.fecha_asignado,
                  reclutador_id: r.reclutador_id
                })));
              }
            }
                
                console.log('✅ Reclutamiento seleccionado:', reclutamiento);

    // PASO 4: Buscar investigación asociada
    let investigacion = null;
    if (reclutamiento.investigacion_id) {
      console.log('🔍 PASO 4: Buscando investigación...');
      const { data: inv, error: invError } = await supabase
        .from('investigaciones')
        .select('*')
        .eq('id', reclutamiento.investigacion_id)
        .single();

      if (invError) {
        console.error('❌ Error consultando investigación:', invError);
      } else {
        investigacion = inv;
        console.log('✅ Investigación encontrada:', investigacion);
      }
    }

    // PASO 5: Buscar usuarios responsables
    let responsableNombre = 'Sin responsable';
    let implementadorNombre = 'Sin implementador';
    
    // LÓGICA DIFERENCIADA POR TIPO DE PARTICIPANTE
    if (tipoParticipante === 'externo') {
      // Para EXTERNOS: Usar el responsable de la investigación
      if (investigacion?.responsable_id) {
        console.log('🔍 PASO 5: Buscando responsable de la investigación (participante externo)...');
        console.log('🔍 ID del responsable de investigación:', investigacion.responsable_id);
        
        const { data: responsableData, error: responsableError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', investigacion.responsable_id)
          .single();
    
        if (responsableError) {
          console.error('❌ Error consultando responsable de investigación:', responsableError);
        } else if (responsableData) {
          console.log('🔍 Datos del responsable de investigación:', responsableData);
          responsableNombre = responsableData.nombre || 'Sin nombre';
          console.log('✅ Responsable de investigación encontrado:', responsableNombre);
        }
      }
    } else if (tipoParticipante === 'friend_family') {
      // Para FRIEND & FAMILY: Usar el reclutador del reclutamiento
      if (reclutamiento.reclutador_id) {
        console.log('🔍 PASO 5: Buscando reclutador del reclutamiento (participante friend&family)...');
        console.log('🔍 ID del reclutador:', reclutamiento.reclutador_id);
        
        const { data: reclutadorData, error: reclutadorError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', reclutamiento.reclutador_id)
          .single();
    
        if (reclutadorError) {
          console.error('❌ Error consultando reclutador:', reclutadorError);
        } else if (reclutadorData) {
          console.log('🔍 Datos del reclutador:', reclutadorData);
          responsableNombre = reclutadorData.nombre || 'Sin nombre';
          console.log('✅ Reclutador encontrado:', responsableNombre);
        }
      }
    } else {
      // Para INTERNOS: Usar el reclutador del reclutamiento
      if (reclutamiento.reclutador_id) {
        console.log('🔍 PASO 5: Buscando reclutador del reclutamiento (participante interno)...');
        console.log('🔍 ID del reclutador:', reclutamiento.reclutador_id);
        
        const { data: reclutadorData, error: reclutadorError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', reclutamiento.reclutador_id)
          .single();
    
        if (reclutadorError) {
          console.error('❌ Error consultando reclutador:', reclutadorError);
        } else if (reclutadorData) {
          console.log('🔍 Datos del reclutador:', reclutadorData);
          responsableNombre = reclutadorData.nombre || 'Sin nombre';
          console.log('✅ Reclutador encontrado:', responsableNombre);
        }
      }
    }
    
    // Fallback: Si no se encontró responsable por la lógica anterior, usar el responsable de la investigación (si aplica)
    if (responsableNombre === 'Sin responsable' && investigacion?.responsable_id) {
      console.log('🔍 PASO 5.2: Fallback a responsable de la investigación...');
      console.log('🔍 ID del responsable de investigación:', investigacion.responsable_id);
      
      const { data: responsableData, error: responsableError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', investigacion.responsable_id)
        .single();
    
      if (responsableError) {
        console.error('❌ Error consultando responsable de investigación:', responsableError);
      } else if (responsableData) {
        console.log('🔍 Datos del responsable de investigación:', responsableData);
        responsableNombre = responsableData.nombre || 'Sin nombre';
        console.log('✅ Responsable de investigación encontrado:', responsableNombre);
      }
    }

    if (investigacion?.implementador_id) {
      console.log('🔍 PASO 6: Buscando implementador...');
      console.log('🔍 ID del implementador:', investigacion.implementador_id);
      
      const { data: implementadorData, error: implementadorError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', investigacion.implementador_id)
        .single();

      if (implementadorError) {
        console.error('❌ Error consultando implementador:', implementadorError);
      } else if (implementadorData) {
        console.log('🔍 Datos del implementador:', implementadorData);
        implementadorNombre = implementadorData.nombre || 'Sin nombre';
        console.log('✅ Implementador encontrado:', implementadorNombre);
      }
    }

    // PASO 7: Obtener nombre del estado de agendamiento
    let estadoAgendamientoNombre = 'Sin estado';
    if (reclutamiento.estado_agendamiento) {
      console.log('🔍 PASO 7: Buscando nombre del estado de agendamiento...');
      console.log('🔍 ID del estado de agendamiento:', reclutamiento.estado_agendamiento);
      
      const { data: estadoData, error: estadoError } = await supabase
        .from('estado_agendamiento_cat')
        .select('nombre')
        .eq('id', reclutamiento.estado_agendamiento)
        .single();
      
      if (estadoError) {
        console.error('❌ Error consultando estado de agendamiento:', estadoError);
      } else if (estadoData) {
        console.log('🔍 Datos del estado de agendamiento:', estadoData);
        estadoAgendamientoNombre = estadoData.nombre || 'Sin nombre';
        console.log('✅ Estado de agendamiento encontrado:', estadoAgendamientoNombre);
      }
    }

    // PASO 8: Formatear respuesta
    const reclutamientoFormateado = {
      id: reclutamiento.id,
      nombre: investigacion?.nombre || 'Sin nombre',
      descripcion: investigacion?.descripcion || 'Sin descripción',
      fecha_inicio: investigacion?.fecha_inicio || reclutamiento.fecha_sesion,
      fecha_sesion: reclutamiento.fecha_sesion,
      duracion_sesion: reclutamiento.duracion_sesion || 60,
      estado: investigacion?.estado || 'Sin estado',
      estado_reclutamiento_nombre: estadoAgendamientoNombre, // Agregamos el nombre del estado
      responsable: responsableNombre,
      implementador: implementadorNombre,
      tipo_investigacion: 'Sin tipo',
      fecha_asignado: reclutamiento.fecha_asignado,
      estado_agendamiento: reclutamiento.estado_agendamiento,
      reclutador_id: reclutamiento.reclutador_id,
      creado_por: reclutamiento.creado_por,
      hora_sesion: reclutamiento.hora_sesion, // Asegurarse de que se incluya
    };
    
    // Debug: Log para verificar qué campos están llegando
    console.log('🔍 API: reclutamiento.hora_sesion:', reclutamiento.hora_sesion);
    console.log('🔍 API: reclutamientoFormateado.hora_sesion:', reclutamientoFormateado.hora_sesion);
    console.log('🔍 API: Campos del reclutamiento original:', Object.keys(reclutamiento));

    console.log('✅ Respuesta final formateada:', reclutamientoFormateado);

    return res.status(200).json({
      reclutamiento: reclutamientoFormateado
    });

  } catch (error) {
    console.error('💥 Error general en API:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
