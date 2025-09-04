import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugDatabase() {
  console.log('🔍 INICIANDO DEBUG DE BASE DE DATOS...\n');

  try {
    // PASO 1: Ver todos los participantes
    console.log('🔍 PASO 1: Listando todos los participantes...');
    const { data: participantes, error: participantesError } = await supabase
      .from('participantes')
      .select('id, nombre, apellido, email')
      .limit(5);

    if (participantesError) {
      console.error('❌ Error consultando participantes:', participantesError);
      return;
    }

    console.log('✅ Participantes encontrados:', participantes);
    console.log('');

    if (participantes && participantes.length > 0) {
      const primerParticipanteId = participantes[0].id;
      console.log('🔍 Usando participante ID:', primerParticipanteId);
      console.log('');

      // PASO 2: Buscar reclutamientos para este participante
      console.log('🔍 PASO 2: Buscando reclutamientos...');
      const { data: reclutamientos, error: reclutamientosError } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('participantes_id', primerParticipanteId);

      if (reclutamientosError) {
        console.error('❌ Error consultando reclutamientos:', reclutamientosError);
        return;
      }

      console.log('✅ Reclutamientos encontrados:', reclutamientos);
      console.log('');

      if (reclutamientos && reclutamientos.length > 0) {
        const primerReclutamiento = reclutamientos[0];
        console.log('🔍 Analizando reclutamiento:', primerReclutamiento.id);
        console.log('');

        // PASO 3: Buscar la investigación asociada
        if (primerReclutamiento.investigacion_id) {
          console.log('🔍 PASO 3: Buscando investigación...');
          const { data: investigacion, error: investigacionError } = await supabase
            .from('investigaciones')
            .select('*')
            .eq('id', primerReclutamiento.investigacion_id)
            .single();

          if (investigacionError) {
            console.error('❌ Error consultando investigación:', investigacionError);
          } else {
            console.log('✅ Investigación encontrada:', investigacion);
            console.log('');

            // PASO 4: Buscar usuarios responsables
            if (investigacion.responsable_id) {
              console.log('🔍 PASO 4: Buscando responsable...');
              const { data: responsable, error: responsableError } = await supabase
                .from('usuarios')
                .select('nombre, apellido')
                .eq('id', investigacion.responsable_id)
                .single();

              if (responsableError) {
                console.error('❌ Error consultando responsable:', responsableError);
              } else {
                console.log('✅ Responsable encontrado:', responsable);
              }
            }

            if (investigacion.implementador_id) {
              console.log('🔍 PASO 5: Buscando implementador...');
              const { data: implementador, error: implementadorError } = await supabase
                .from('usuarios')
                .select('nombre, apellido')
                .eq('id', investigacion.implementador_id)
                .single();

              if (implementadorError) {
                console.error('❌ Error consultando implementador:', implementadorError);
              } else {
                console.log('✅ Implementador encontrado:', implementador);
              }
            }
          }
        } else {
          console.log('⚠️ El reclutamiento no tiene investigacion_id');
        }
      } else {
        console.log('⚠️ No hay reclutamientos para este participante');
      }
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

debugDatabase();
