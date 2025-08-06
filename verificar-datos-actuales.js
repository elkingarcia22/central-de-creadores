const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verificarDatosActuales() {
  try {
    console.log('🔍 Verificando datos actuales...');
    
    // 1. Verificar investigaciones con estados de reclutamiento
    console.log('\n📊 1. Investigaciones con estados de reclutamiento:');
    const { data: investigaciones, error: errorInv } = await supabase
      .from('investigaciones')
      .select(`
        id,
        nombre,
        estado,
        fecha_inicio,
        fecha_fin,
        riesgo_automatico,
        libreto,
        responsable_id,
        implementador_id
      `)
      .in('estado', ['en_borrador', 'en_progreso', 'pausado', 'deprecado']);
    
    if (errorInv) {
      console.log('❌ Error obteniendo investigaciones:', errorInv.message);
    } else {
      console.log('✅ Investigaciones encontradas:', investigaciones?.length || 0);
      if (investigaciones && investigaciones.length > 0) {
        console.log('📋 Ejemplos:', investigaciones.slice(0, 3));
      }
    }
    
    // 2. Verificar tabla estado_reclutamiento_cat
    console.log('\n📊 2. Estados de reclutamiento:');
    const { data: estadosReclutamiento, error: errorEstados } = await supabase
      .from('estado_reclutamiento_cat')
      .select('*')
      .order('orden');
    
    if (errorEstados) {
      console.log('❌ Error obteniendo estados de reclutamiento:', errorEstados.message);
    } else {
      console.log('✅ Estados de reclutamiento encontrados:', estadosReclutamiento?.length || 0);
      if (estadosReclutamiento && estadosReclutamiento.length > 0) {
        console.log('📋 Estados:', estadosReclutamiento);
      }
    }
    
    // 3. Verificar tabla reclutamientos (si existe)
    console.log('\n📊 3. Tabla reclutamientos:');
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select('*')
      .limit(5);
    
    if (errorReclutamientos) {
      console.log('❌ Error obteniendo reclutamientos:', errorReclutamientos.message);
    } else {
      console.log('✅ Reclutamientos encontrados:', reclutamientos?.length || 0);
      if (reclutamientos && reclutamientos.length > 0) {
        console.log('📋 Ejemplos:', reclutamientos);
      }
    }
    
    // 4. Verificar tabla seguimientos_investigacion
    console.log('\n📊 4. Seguimientos de investigación:');
    const { data: seguimientos, error: errorSeguimientos } = await supabase
      .from('seguimientos_investigacion')
      .select('*')
      .limit(5);
    
    if (errorSeguimientos) {
      console.log('❌ Error obteniendo seguimientos:', errorSeguimientos.message);
    } else {
      console.log('✅ Seguimientos encontrados:', seguimientos?.length || 0);
      if (seguimientos && seguimientos.length > 0) {
        console.log('📋 Ejemplos:', seguimientos);
      }
    }
    
    // 5. Verificar tabla participantes
    console.log('\n📊 5. Participantes:');
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes')
      .select('*')
      .limit(5);
    
    if (errorParticipantes) {
      console.log('❌ Error obteniendo participantes:', errorParticipantes.message);
    } else {
      console.log('✅ Participantes encontrados:', participantes?.length || 0);
      if (participantes && participantes.length > 0) {
        console.log('📋 Ejemplos:', participantes);
      }
    }
    
    // 6. Verificar usuarios
    console.log('\n📊 6. Usuarios:');
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .limit(5);
    
    if (errorUsuarios) {
      console.log('❌ Error obteniendo usuarios:', errorUsuarios.message);
    } else {
      console.log('✅ Usuarios encontrados:', usuarios?.length || 0);
      if (usuarios && usuarios.length > 0) {
        console.log('📋 Ejemplos:', usuarios);
      }
    }
    
    // 7. Verificar libretos
    console.log('\n📊 7. Libretos:');
    const { data: libretos, error: errorLibretos } = await supabase
      .from('libretos_investigacion')
      .select('*')
      .limit(5);
    
    if (errorLibretos) {
      console.log('❌ Error obteniendo libretos:', errorLibretos.message);
    } else {
      console.log('✅ Libretos encontrados:', libretos?.length || 0);
      if (libretos && libretos.length > 0) {
        console.log('📋 Ejemplos:', libretos);
      }
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

verificarDatosActuales(); 