import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { dryRun = false } = req.body;

    console.log('🚀 Iniciando migración de sesiones existentes...');
    console.log(`📋 Modo: ${dryRun ? 'DRY RUN (sin cambios)' : 'EJECUCIÓN REAL'}`);

    // 1. Obtener reclutamientos con fecha_sesion
    console.log('📊 Obteniendo reclutamientos con sesiones...');
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento,
        reclutador_id,
        created_at,
        updated_at,
        investigaciones!inner(
          id,
          nombre,
          color
        ),
        participantes!inner(
          id,
          nombre,
          email
        )
      `)
      .not('fecha_sesion', 'is', null)
      .not('duracion_sesion', 'is', null);

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos' });
    }

    console.log(`📈 Encontrados ${reclutamientos?.length || 0} reclutamientos con sesiones`);

    if (!reclutamientos || reclutamientos.length === 0) {
      return res.status(200).json({
        message: 'No hay reclutamientos con sesiones para migrar',
        migrated: 0,
        errors: []
      });
    }

    const results = {
      total: reclutamientos.length,
      migrated: 0,
      errors: [] as string[],
      details: [] as any[]
    };

    // 2. Procesar cada reclutamiento
    for (const reclutamiento of reclutamientos) {
      try {
        console.log(`🔄 Procesando reclutamiento ${reclutamiento.id}...`);

        // Crear sesión
        const sesionData = {
          investigacion_id: reclutamiento.investigacion_id,
          titulo: `Sesión con ${reclutamiento.participantes?.nombre || 'Participante'}`,
          descripcion: `Sesión migrada desde reclutamiento ${reclutamiento.id}`,
          fecha_programada: reclutamiento.fecha_sesion,
          duracion_minutos: reclutamiento.duracion_sesion,
          estado: 'programada',
          tipo_sesion: 'virtual' as const,
          ubicacion: '',
          sala: '',
          moderador_id: reclutamiento.reclutador_id,
          observadores: [],
          grabacion_permitida: false,
          notas_publicas: `Migrado desde reclutamiento: ${reclutamiento.id}`,
          notas_privadas: '',
          configuracion: {},
          created_at: reclutamiento.created_at,
          updated_at: reclutamiento.updated_at
        };

        if (!dryRun) {
          // Insertar sesión
          const { data: sesion, error: errorSesion } = await supabase
            .from('sesiones')
            .insert(sesionData)
            .select()
            .single();

          if (errorSesion) {
            throw new Error(`Error creando sesión: ${errorSesion.message}`);
          }

          // Crear participante en sesión
          if (reclutamiento.participantes_id) {
            const participanteData = {
              sesion_id: sesion.id,
              participante_id: reclutamiento.participantes_id,
              estado: 'invitado' as const,
              fecha_confirmacion: null,
              hora_llegada: null,
              hora_salida: null,
              asistencia_completa: false,
              puntuacion: null,
              comentarios: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { error: errorParticipante } = await supabase
              .from('sesion_participantes')
              .insert(participanteData);

            if (errorParticipante) {
              console.warn(`⚠️ Error agregando participante a sesión: ${errorParticipante.message}`);
            }
          }

          results.migrated++;
          results.details.push({
            reclutamiento_id: reclutamiento.id,
            sesion_id: sesion.id,
            participante: reclutamiento.participantes?.nombre,
            investigacion: reclutamiento.investigaciones?.nombre,
            fecha: reclutamiento.fecha_sesion
          });

          console.log(`✅ Migrado: ${reclutamiento.id} -> ${sesion.id}`);
        } else {
          results.migrated++;
          results.details.push({
            reclutamiento_id: reclutamiento.id,
            sesion_id: 'DRY_RUN',
            participante: reclutamiento.participantes?.nombre,
            investigacion: reclutamiento.investigaciones?.nombre,
            fecha: reclutamiento.fecha_sesion
          });

          console.log(`🔍 DRY RUN: ${reclutamiento.id} -> [SESIÓN_CREADA]`);
        }

      } catch (error) {
        const errorMsg = `Error procesando reclutamiento ${reclutamiento.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    console.log('🎉 Migración completada');
    console.log(`📊 Resultados: ${results.migrated}/${results.total} migrados, ${results.errors.length} errores`);

    return res.status(200).json({
      message: `Migración ${dryRun ? 'simulada' : 'completada'}`,
      ...results
    });

  } catch (error) {
    console.error('❌ Error en migración:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
