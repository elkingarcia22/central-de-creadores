// Script para crear un reclutamiento con fecha de sesión para probar estados
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'tu-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearReclutamientoConFecha() {
  console.log('📅 === CREANDO RECLUTAMIENTO CON FECHA DE SESIÓN ===\n');

  try {
    // 1. Obtener una investigación existente
    console.log('🔍 Obteniendo investigación existente...');
    const { data: investigaciones, error: errorInvestigaciones } = await supabase
      .from('investigaciones')
      .select('id, titulo')
      .limit(1);

    if (errorInvestigaciones || !investigaciones || investigaciones.length === 0) {
      console.error('❌ Error obteniendo investigaciones:', errorInvestigaciones);
      return;
    }

    const investigacion = investigaciones[0];
    console.log(`✅ Investigación seleccionada: ${investigacion.titulo} (${investigacion.id})`);

    // 2. Obtener un participante existente
    console.log('👤 Obteniendo participante existente...');
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes')
      .select('id, nombre')
      .limit(1);

    if (errorParticipantes || !participantes || participantes.length === 0) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }

    const participante = participantes[0];
    console.log(`✅ Participante seleccionado: ${participante.nombre} (${participante.id})`);

    // 3. Obtener un reclutador existente
    console.log('👨‍💼 Obteniendo reclutador existente...');
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('id, full_name')
      .limit(1);

    if (errorUsuarios || !usuarios || usuarios.length === 0) {
      console.error('❌ Error obteniendo usuarios:', errorUsuarios);
      return;
    }

    const reclutador = usuarios[0];
    console.log(`✅ Reclutador seleccionado: ${reclutador.full_name} (${reclutador.id})`);

    // 4. Obtener estado "En progreso"
    console.log('📊 Obteniendo estado "En progreso"...');
    const { data: estados, error: errorEstados } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre')
      .eq('nombre', 'En progreso')
      .single();

    if (errorEstados || !estados) {
      console.error('❌ Error obteniendo estado "En progreso":', errorEstados);
      return;
    }

    console.log(`✅ Estado seleccionado: ${estados.nombre} (${estados.id})`);

    // 5. Crear fecha de sesión (mañana a las 2 PM)
    const fechaSesion = new Date();
    fechaSesion.setDate(fechaSesion.getDate() + 1); // Mañana
    fechaSesion.setHours(14, 0, 0, 0); // 2 PM

    console.log(`📅 Fecha de sesión programada: ${fechaSesion.toISOString()}`);

    // 6. Crear el reclutamiento
    console.log('➕ Creando reclutamiento...');
    const { data: reclutamiento, error: errorReclutamiento } = await supabase
      .from('reclutamientos')
      .insert({
        investigacion_id: investigacion.id,
        participantes_id: participante.id,
        reclutador_id: reclutador.id,
        fecha_sesion: fechaSesion.toISOString(),
        duracion_sesion: 60,
        estado_agendamiento: estados.id,
        creado_por: reclutador.id
      })
      .select()
      .single();

    if (errorReclutamiento) {
      console.error('❌ Error creando reclutamiento:', errorReclutamiento);
      return;
    }

    console.log(`✅ Reclutamiento creado exitosamente: ${reclutamiento.id}`);
    console.log(`📊 Estado inicial: ${estados.nombre}`);

    // 7. Verificar que aparece en la API
    console.log('\n🔍 Verificando que aparece en la API...');
    const response = await fetch(`http://localhost:3000/api/metricas-reclutamientos?usuarioId=${reclutador.id}&esAdmin=true&rol=administrador`);
    
    if (response.ok) {
      const data = await response.json();
      const reclutamientoEnAPI = data.investigaciones.find(inv => inv.reclutamiento_id === reclutamiento.id);
      
      if (reclutamientoEnAPI) {
        console.log('✅ Reclutamiento encontrado en la API:');
        console.log(`   - Investigación: ${reclutamientoEnAPI.investigacion_nombre}`);
        console.log(`   - Estado: ${reclutamientoEnAPI.estado_reclutamiento_nombre}`);
        console.log(`   - Fecha sesión: ${reclutamientoEnAPI.fecha_sesion}`);
      } else {
        console.log('⚠️ Reclutamiento no encontrado en la API');
      }
    } else {
      console.log('❌ Error verificando API');
    }

    console.log('\n🎯 Reclutamiento de prueba creado exitosamente!');
    console.log('📝 Ahora puedes probar el sistema de estados en la plataforma.');

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar la función
crearReclutamientoConFecha();
