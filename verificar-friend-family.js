const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://elsoncaptettdvrvwypji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExNjAyNCwiZXhwIjoyMDY1NjkyMDI0fQ.b4-pu9KmNmn6jYYv1HgSKtoSRzjZDEEpdhtHcXxqWxw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarFriendFamily() {
  console.log('🔍 VERIFICANDO ESTADO DE FRIEND AND FAMILY...\n');

  try {
    // 1. Verificar reclutamientos actuales
    console.log('1. RECLUTAMIENTOS ACTUALES:');
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
    } else {
      console.log('✅ Reclutamientos encontrados:', reclutamientos.length);
      reclutamientos.forEach((r, i) => {
        console.log(`   ${i + 1}. ID: ${r.id}`);
        console.log(`      Tipo: ${r.tipo_participante}`);
        console.log(`      Participante ID: ${r.participantes_friend_family_id || r.participantes_internos_id || r.participantes_id}`);
        console.log(`      Fecha: ${r.fecha_sesion}`);
        console.log('');
      });
    }

    // 2. Verificar participantes Friend and Family
    console.log('2. PARTICIPANTES FRIEND AND FAMILY:');
    const { data: participantesFF, error: errorParticipantes } = await supabase
      .from('participantes_friend_family')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes FF:', errorParticipantes);
    } else {
      console.log('✅ Participantes FF encontrados:', participantesFF.length);
      participantesFF.forEach((p, i) => {
        console.log(`   ${i + 1}. ID: ${p.id}`);
        console.log(`      Nombre: ${p.nombre}`);
        console.log(`      Email: ${p.email}`);
        console.log(`      Departamento: ${p.departamento_id}`);
        console.log(`      Rol: ${p.rol_empresa_id}`);
        console.log('');
      });
    }

    // 3. Verificar historial Friend and Family
    console.log('3. HISTORIAL FRIEND AND FAMILY:');
    const { data: historialFF, error: errorHistorial } = await supabase
      .from('historial_participacion_participantes_friend_family')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorHistorial) {
      console.error('❌ Error obteniendo historial FF:', errorHistorial);
    } else {
      console.log('✅ Registros en historial FF:', historialFF.length);
      historialFF.forEach((h, i) => {
        console.log(`   ${i + 1}. ID: ${h.id}`);
        console.log(`      Participante: ${h.participante_friend_family_id}`);
        console.log(`      Reclutamiento: ${h.reclutamiento_id}`);
        console.log(`      Estado: ${h.estado_sesion}`);
        console.log('');
      });
    }

    // 4. Verificar vista de estadísticas
    console.log('4. VISTA ESTADÍSTICAS FRIEND AND FAMILY:');
    const { data: estadisticasFF, error: errorEstadisticas } = await supabase
      .from('vista_estadisticas_participantes_friend_family')
      .select('*');

    if (errorEstadisticas) {
      console.error('❌ Error obteniendo estadísticas FF:', errorEstadisticas);
    } else {
      console.log('✅ Estadísticas FF encontradas:', estadisticasFF.length);
      estadisticasFF.forEach((e, i) => {
        console.log(`   ${i + 1}. Participante: ${e.participante_id}`);
        console.log(`      Total participaciones: ${e.total_participaciones}`);
        console.log(`      Última sesión: ${e.ultima_sesion}`);
        console.log(`      Última investigación: ${e.ultima_investigacion}`);
        console.log('');
      });
    }

    // 5. Corregir reclutamiento si es necesario
    console.log('5. CORRIGIENDO RECLUTAMIENTO...');
    const reclutamientoConFF = reclutamientos?.find(r => r.participantes_friend_family_id);
    
    if (reclutamientoConFF && reclutamientoConFF.tipo_participante !== 'friend_family') {
      console.log('🔄 Corrigiendo tipo de participante...');
      
      const { error: errorUpdate } = await supabase
        .from('reclutamientos')
        .update({ 
          tipo_participante: 'friend_family',
          participantes_id: null,
          participantes_internos_id: null
        })
        .eq('id', reclutamientoConFF.id);

      if (errorUpdate) {
        console.error('❌ Error corrigiendo reclutamiento:', errorUpdate);
      } else {
        console.log('✅ Reclutamiento corregido exitosamente');
      }
    } else {
      console.log('ℹ️ No se necesita corrección');
    }

    console.log('\n✅ VERIFICACIÓN COMPLETADA');

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

verificarFriendFamily(); 