import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

console.log('DEBUG ENV: SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🚀 === ACTUALIZANDO ESTADOS DESDE API ===');

    // 1. Verificar estados actuales
    console.log('1. Verificando estados actuales...');
    const { data: estadosActuales, error: errorEstados } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        fecha_sesion,
        duracion_sesion,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        estado_agendamiento
      `)
      .order('fecha_sesion', { ascending: false });

    if (errorEstados) {
      console.error('Error al obtener estados:', errorEstados);
      return res.status(500).json({ error: 'Error al obtener estados' });
    }

    console.log(`📊 Encontrados ${estadosActuales.length} reclutamientos`);
    console.log('Primer reclutamiento:', estadosActuales[0]);

    // 2. Obtener IDs de estados
    console.log('2. Obteniendo IDs de estados...');
    // Obtener estados de agendamiento dinámicamente
    const { data: estadosData, error: estadosError } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre, activo');

    if (estadosError) {
      console.error('Error al obtener catálogo de estados:', estadosError);
      return res.status(500).json({ error: 'Error al obtener catálogo de estados' });
    }

    const estadoIds = {};
    estadosData.forEach(estado => {
      estadoIds[estado.nombre] = estado.id;
    });

    console.log('📋 IDs de estados:', estadoIds);
    console.log('📋 Estados data:', estadosData);

    // 3. Actualizar estados
    console.log('3. Actualizando estados...');
    let actualizados = 0;
    let sinCambios = 0;

    for (const reclutamiento of estadosActuales) {
      console.log('Procesando reclutamiento:', reclutamiento.id);
      console.log('Estado actual:', reclutamiento.estado_agendamiento);
      
      // Verificar si tiene participantes agregados
      const tieneParticipantes = (
        reclutamiento.participantes_id !== null ||
        reclutamiento.participantes_internos_id !== null ||
        reclutamiento.participantes_friend_family_id !== null
      );

      console.log(`Reclutamiento ${reclutamiento.id}: tieneParticipantes = ${tieneParticipantes}`);

      if (!reclutamiento.fecha_sesion) {
        // Sin fecha = Pendiente de agendamiento
        if (tieneParticipantes) {
          // Si tiene participantes pero no fecha, debería estar "En progreso"
          await actualizarEstadoReclutamiento(reclutamiento.id, estadoIds['En progreso'], estadosData);
          actualizados++;
        } else {
          // Sin participantes = Pendiente
          await actualizarEstadoReclutamiento(reclutamiento.id, estadoIds['Pendiente'], estadosData);
          actualizados++;
        }
        continue;
      }

      const fechaSesion = new Date(reclutamiento.fecha_sesion);
      const duracionMinutos = reclutamiento.duracion_sesion || 60;
      const fechaFin = new Date(fechaSesion.getTime() + (duracionMinutos * 60 * 1000));
      const ahora = new Date();

      // Convertir a Colombia
      const fechaSesionColombia = fechaSesion.toLocaleString("en-US", { timeZone: "America/Bogota" });
      const fechaFinColombia = fechaFin.toLocaleString("en-US", { timeZone: "America/Bogota" });
      const ahoraColombia = ahora.toLocaleString("en-US", { timeZone: "America/Bogota" });

      const fechaSesionCol = new Date(fechaSesionColombia);
      const fechaFinCol = new Date(fechaFinColombia);
      const ahoraCol = new Date(ahoraColombia);

      // LOGS DE DEPURACIÓN
      console.log('==============================');
      console.log('ID:', reclutamiento.id);
      console.log('fechaSesion (UTC):', fechaSesion.toISOString());
      console.log('fechaFin (UTC):', fechaFin.toISOString());
      console.log('ahora (UTC):', ahora.toISOString());
      console.log('duracionMinutos:', duracionMinutos);
      console.log('fechaSesionCol:', fechaSesionCol.toISOString());
      console.log('fechaFinCol:', fechaFinCol.toISOString());
      console.log('ahoraCol:', ahoraCol.toISOString());
      console.log('Estado actual:', reclutamiento.estado_agendamiento);
      console.log('Tiene participantes:', tieneParticipantes);

      let nuevoEstadoId;

      if (ahoraCol < fechaSesionCol) {
        // Sesión futura
        if (tieneParticipantes) {
          nuevoEstadoId = estadoIds['En progreso'];
          console.log('Nuevo estado calculado: En progreso (con participantes, fecha futura)');
        } else {
          nuevoEstadoId = estadoIds['Pendiente'];
          console.log('Nuevo estado calculado: Pendiente (sin participantes)');
        }
      } else if (ahoraCol >= fechaSesionCol && ahoraCol <= fechaFinCol) {
        // Sesión en curso
        nuevoEstadoId = estadoIds['En progreso'];
        console.log('Nuevo estado calculado: En progreso (sesión en curso)');
      } else {
        // Sesión pasada - SOLO si no está ya finalizado
        if (reclutamiento.estado_agendamiento === estadoIds['Finalizado']) {
          // Si ya está finalizado, mantener el estado
          nuevoEstadoId = reclutamiento.estado_agendamiento;
          console.log('Nuevo estado calculado: Mantener Finalizado (ya estaba finalizado)');
        } else {
          nuevoEstadoId = estadoIds['Finalizado'];
          console.log('Nuevo estado calculado: Finalizado (sesión pasada)');
        }
      }

      // Solo actualizar si el estado es diferente
      // Usar el estado_agendamiento que ya tenemos del reclutamiento
      const estadoActual = reclutamiento.estado_agendamiento;
      const estadoActualNombre = estadosData.find(e => e.id === estadoActual)?.nombre || 'Sin estado';
      
      console.log('Estado actual ID:', estadoActual);
      console.log('Estado actual nombre:', estadoActualNombre);
      console.log('Nuevo estado ID:', nuevoEstadoId);
      
      // Solo actualizar si el estado actual es uno que puede ser actualizado automáticamente
      const estadosActualizables = [
        estadoIds['Pendiente'], 
        estadoIds['Pendiente de agendamiento']
        // REMOVIDO: estadoIds['En progreso'] - No actualizar automáticamente reclutamientos en progreso
      ];
      
      console.log('Estados actualizables:', estadosActualizables);
      console.log('¿Es actualizable?', estadosActualizables.includes(estadoActual));
      console.log('¿Es diferente?', estadoActual !== nuevoEstadoId);
      
      if (estadosActualizables.includes(estadoActual) && estadoActual !== nuevoEstadoId) {
        console.log('Actualizando estado...');
        await actualizarEstadoReclutamiento(reclutamiento.id, nuevoEstadoId, estadosData);
        const nuevoEstadoNombre = estadosData.find(e => e.id === nuevoEstadoId)?.nombre;
        console.log(`✅ Actualizado ${reclutamiento.investigacion_id}: ${estadoActualNombre} → ${nuevoEstadoNombre}`);
        
        // Sincronizar historial si el estado es "Finalizado"
        if (nuevoEstadoNombre === 'Finalizado') {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/sincronizar-historico`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reclutamiento_id: reclutamiento.id
              })
            });
            
            if (response.ok) {
              console.log(`✅ Historial sincronizado para reclutamiento ${reclutamiento.id}`);
            } else {
              console.log(`⚠️  No se pudo sincronizar historial para reclutamiento ${reclutamiento.id}`);
            }
          } catch (error) {
            console.log(`⚠️  Error sincronizando historial: ${error}`);
          }
        }
        
        actualizados++;
      } else {
        console.log(`ℹ️  Respetando estado actual: ${estadoActualNombre} (no se actualiza automáticamente)`);
        sinCambios++;
      }
    }

    console.log(`✅ Actualización completada: ${actualizados} actualizados, ${sinCambios} sin cambios`);

    // 4. Verificar resultados finales
    console.log('4. Verificando resultados finales...');
    const { data: resultadosFinales, error: errorFinales } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento
      `)
      .order('fecha_sesion', { ascending: false })
      .limit(5);

    if (errorFinales) {
      console.error('Error al verificar resultados finales:', errorFinales);
    } else {
      console.log('📊 Resultados finales:');
      resultadosFinales.forEach(r => {
        const estadoNombre = estadosData.find(e => e.id === r.estado_agendamiento)?.nombre || 'Sin estado';
        console.log(`- ID: ${r.id}`);
        console.log(`  Fecha: ${r.fecha_sesion}`);
        console.log(`  Duración: ${r.duracion_sesion} min`);
        console.log(`  Estado: ${estadoNombre}`);
        console.log('');
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Estados actualizados exitosamente',
      actualizados,
      sinCambios,
      total: estadosActuales.length,
      resultados: resultadosFinales
    });

  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

const actualizarEstadoReclutamiento = async (reclutamientoId: string, nuevoEstadoId: string, estados: any[]) => {
  try {
    console.log(`Actualizando reclutamiento ${reclutamientoId} a estado ${nuevoEstadoId}`);
    
    // Actualizar directamente el estado_agendamiento en la tabla reclutamientos
    const { error } = await supabase
      .from('reclutamientos')
      .update({ 
        estado_agendamiento: nuevoEstadoId
      })
      .eq('id', reclutamientoId);

    if (error) {
      console.error(`Error actualizando estado de reclutamiento ${reclutamientoId}:`, error);
      throw error;
    }

    console.log(`✅ Estado actualizado para reclutamiento ${reclutamientoId}`);
  } catch (error) {
    console.error(`❌ Error en actualizarEstadoReclutamiento:`, error);
    throw error;
  }
};

const sincronizarHistorialReclutamiento = async (reclutamientoId: string) => {
  try {
    // Obtener información del reclutamiento
    const { data: reclutamiento, error: errorReclutamiento } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        participantes(id, empresa_id),
        participantes_internos(id)
      `)
      .eq('id', reclutamientoId)
      .single();

    if (errorReclutamiento || !reclutamiento) {
      console.error('Error obteniendo reclutamiento para sincronización:', errorReclutamiento);
      return;
    }

    // Determinar si es participante externo o interno
    if (reclutamiento.participantes_id) {
      // Participante externo
      const { error: errorInsert } = await supabase
        .from('historial_participacion_participantes')
        .insert({
          participante_id: reclutamiento.participantes_id,
          investigacion_id: reclutamiento.investigacion_id,
          reclutamiento_id: reclutamiento.id,
          empresa_id: reclutamiento.participantes.empresa_id,
          fecha_participacion: reclutamiento.fecha_sesion,
          estado_sesion: 'completada',
          duracion_sesion: reclutamiento.duracion_sesion,
          creado_por: reclutamiento.creado_por
        })
        .select();

      if (errorInsert) {
        console.error('Error sincronizando historial participante externo:', errorInsert);
      } else {
        console.log('✅ Historial de participante externo sincronizado');
      }
    } else if (reclutamiento.participantes_internos_id) {
      // Participante interno
      const { error: errorInsert } = await supabase
        .from('historial_participacion_participantes_internos')
        .insert({
          participante_interno_id: reclutamiento.participantes_internos_id,
          investigacion_id: reclutamiento.investigacion_id,
          reclutamiento_id: reclutamiento.id,
          fecha_participacion: reclutamiento.fecha_sesion,
          estado_sesion: 'completada',
          duracion_minutos: reclutamiento.duracion_sesion,
          reclutador_id: reclutamiento.reclutador_id,
          observaciones: 'Sincronizado automáticamente',
          creado_por: reclutamiento.creado_por
        })
        .select();

      if (errorInsert) {
        console.error('Error sincronizando historial participante interno:', errorInsert);
      } else {
        console.log('✅ Historial de participante interno sincronizado');
      }
    }
  } catch (error) {
    console.error('Error en sincronización de historial:', error);
  }
}; 