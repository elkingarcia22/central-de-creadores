// ====================================
// EJECUTAR TRIGGER SQL
// ====================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const ejecutarTrigger = async () => {
  console.log('🚀 === EJECUTANDO TRIGGER SQL ===');
  
  try {
    // 1. ELIMINAR TRIGGER ANTERIOR
    console.log('1. Eliminando trigger anterior...');
    await supabase.rpc('exec_sql', {
      sql: 'DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;'
    });
    
    // 2. ELIMINAR FUNCIÓN ANTERIOR
    console.log('2. Eliminando función anterior...');
    await supabase.rpc('exec_sql', {
      sql: 'DROP FUNCTION IF EXISTS actualizar_estado_reclutamiento_con_duracion();'
    });
    
    // 3. CREAR FUNCIÓN MEJORADA
    console.log('3. Creando función mejorada...');
    const funcionSQL = `
      CREATE OR REPLACE FUNCTION actualizar_estado_reclutamiento_con_duracion()
      RETURNS TRIGGER AS $$
      DECLARE
          fecha_actual TIMESTAMP WITH TIME ZONE;
          fecha_inicio_sesion TIMESTAMP WITH TIME ZONE;
          fecha_fin_sesion TIMESTAMP WITH TIME ZONE;
          duracion_sesion_minutos INTEGER;
          estado_pendiente_id UUID;
          estado_en_progreso_id UUID;
          estado_finalizado_id UUID;
          estado_pendiente_agendamiento_id UUID;
          nuevo_estado_id UUID;
          
          -- Variables para zona horaria Colombia
          fecha_actual_colombia TIMESTAMP;
          fecha_inicio_colombia TIMESTAMP;
          fecha_fin_colombia TIMESTAMP;
      BEGIN
          -- Obtener fecha actual
          fecha_actual := NOW();
          
          -- Obtener fecha de sesión y duración del reclutamiento
          fecha_inicio_sesion := NEW.fecha_sesion;
          duracion_sesion_minutos := COALESCE(NEW.duracion_sesion, 60); -- por defecto 60 minutos
          
          -- Calcular fecha de fin de sesión
          fecha_fin_sesion := fecha_inicio_sesion + (duracion_sesion_minutos || ' minutes')::INTERVAL;
          
          -- Obtener IDs de estados
          SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
          SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
          SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
          SELECT id INTO estado_pendiente_agendamiento_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento';
          
          -- Convertir fechas a zona horaria Colombia
          fecha_actual_colombia := fecha_actual AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota';
          fecha_inicio_colombia := fecha_inicio_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota';
          fecha_fin_colombia := fecha_fin_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota';
          
          -- Debug: Imprimir información
          RAISE NOTICE '=== DEBUG ESTADO RECLUTAMIENTO ===';
          RAISE NOTICE 'Fecha actual (UTC): %, Colombia: %', fecha_actual, fecha_actual_colombia;
          RAISE NOTICE 'Inicio sesión (UTC): %, Colombia: %', fecha_inicio_sesion, fecha_inicio_colombia;
          RAISE NOTICE 'Fin sesión (UTC): %, Colombia: %', fecha_fin_sesion, fecha_fin_colombia;
          RAISE NOTICE 'Duración: % minutos', duracion_sesion_minutos;
          
          -- Lógica de estados mejorada con zona horaria Colombia
          IF fecha_inicio_sesion IS NULL THEN
              -- Sin fecha de sesión = Pendiente de agendamiento
              nuevo_estado_id := estado_pendiente_agendamiento_id;
              RAISE NOTICE 'Estado asignado: Pendiente de agendamiento (sin fecha)';
          ELSIF fecha_actual_colombia < fecha_inicio_colombia THEN
              -- Antes del inicio = Pendiente
              nuevo_estado_id := estado_pendiente_id;
              RAISE NOTICE 'Estado asignado: Pendiente (antes del inicio)';
          ELSIF fecha_actual_colombia >= fecha_inicio_colombia AND fecha_actual_colombia <= fecha_fin_colombia THEN
              -- Durante la sesión = En progreso
              nuevo_estado_id := estado_en_progreso_id;
              RAISE NOTICE 'Estado asignado: En progreso (durante la sesión)';
          ELSE
              -- Después del fin = Finalizado
              nuevo_estado_id := estado_finalizado_id;
              RAISE NOTICE 'Estado asignado: Finalizado (después del fin)';
          END IF;
          
          -- Actualizar el estado solo si es diferente
          IF NEW.estado_agendamiento IS DISTINCT FROM nuevo_estado_id THEN
              NEW.estado_agendamiento := nuevo_estado_id;
              RAISE NOTICE 'Estado actualizado de % a %', OLD.estado_agendamiento, nuevo_estado_id;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await supabase.rpc('exec_sql', { sql: funcionSQL });
    
    // 4. CREAR TRIGGER
    console.log('4. Creando trigger...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TRIGGER trigger_actualizar_estado_reclutamiento
            BEFORE INSERT OR UPDATE ON reclutamientos
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_estado_reclutamiento_con_duracion();
      `
    });
    
    // 5. ACTUALIZAR ESTADOS EXISTENTES
    console.log('5. Actualizando estados existentes...');
    const updateSQL = `
      UPDATE reclutamientos 
      SET estado_agendamiento = CASE
          WHEN fecha_sesion IS NULL THEN 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
          WHEN NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' < fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' THEN 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
          WHEN NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' >= fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' 
               AND NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' <= (fecha_sesion + (COALESCE(duracion_sesion, 60) || ' minutes')::INTERVAL) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' THEN 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
          ELSE 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
      END
      WHERE estado_agendamiento IS NULL OR estado_agendamiento != CASE
          WHEN fecha_sesion IS NULL THEN 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
          WHEN NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' < fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' THEN 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
          WHEN NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' >= fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' 
               AND NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' <= (fecha_sesion + (COALESCE(duracion_sesion, 60) || ' minutes')::INTERVAL) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' THEN 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
          ELSE 
              (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
      END;
    `;
    
    const { data: updateResult, error: updateError } = await supabase.rpc('exec_sql', { sql: updateSQL });
    
    if (updateError) {
      console.error('Error al actualizar estados:', updateError);
    } else {
      console.log('✅ Estados actualizados exitosamente');
    }
    
    // 6. VERIFICAR RESULTADOS
    console.log('6. Verificando resultados...');
    const { data: resultados, error: errorResultados } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento,
        estado_agendamiento_cat!inner(nombre)
      `)
      .order('fecha_sesion', { ascending: false })
      .limit(5);
    
    if (errorResultados) {
      console.error('Error al verificar resultados:', errorResultados);
    } else {
      console.log('📊 Resultados:');
      resultados.forEach(r => {
        console.log(`- ID: ${r.id}`);
        console.log(`  Fecha: ${r.fecha_sesion}`);
        console.log(`  Duración: ${r.duracion_sesion} min`);
        console.log(`  Estado: ${r.estado_agendamiento_cat.nombre}`);
        console.log('');
      });
    }
    
    console.log('✅ Trigger ejecutado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al ejecutar trigger:', error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarTrigger();
}

module.exports = { ejecutarTrigger }; 