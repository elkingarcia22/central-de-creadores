// Script para crear un reclutamiento de hoy y verificar el estado
const crearReclutamientoHoy = async () => {
  console.log('📅 Creando reclutamiento para hoy...\n');

  try {
    // Obtener fecha actual
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().slice(0, 10);
    
    console.log('📅 Fecha actual:', fechaHoy);
    console.log('🕐 Hora actual:', ahora.toTimeString().slice(0, 5));
    
    // Crear reclutamiento para hoy a las 2 PM
    const fechaHoy2PM = new Date(`${fechaHoy}T14:00:00`);
    
    console.log('📅 Creando reclutamiento para hoy a las 2 PM...');
    const response = await fetch('http://localhost:3000/api/reclutamientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantes_id: '740e6e80-e8cc-4157-9e3f-237ca3868b46',
        reclutador_id: '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6',
        fecha_sesion: fechaHoy2PM.toISOString(),
        investigacion_id: '603b9cb7-fbf7-43db-844b-aef89b9921b5'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Reclutamiento creado exitosamente!');
      console.log('   ID:', data.id);
      console.log('   Fecha sesión:', fechaHoy2PM.toISOString());
      console.log('   Estado esperado: En progreso');
      
      // Verificar el estado después de crear
      console.log('\n🔍 Verificando estado después de crear...');
      const responseVerificacion = await fetch('http://localhost:3000/api/participantes-reclutamiento?investigacion_id=603b9cb7-fbf7-43db-844b-aef89b9921b5');
      
      if (responseVerificacion.ok) {
        const dataVerificacion = await responseVerificacion.json();
        const reclutamientos = dataVerificacion.participantes || [];
        
        // Buscar el reclutamiento recién creado
        const reclutamientoCreado = reclutamientos.find(r => r.id === data.id);
        
        if (reclutamientoCreado) {
          console.log('✅ Estado del reclutamiento creado:');
          console.log('   Estado:', reclutamientoCreado.estado_agendamiento?.nombre || 'Sin estado');
          console.log('   Color:', reclutamientoCreado.estado_agendamiento?.color || 'Sin color');
          console.log('   Fecha:', reclutamientoCreado.fecha_sesion);
        } else {
          console.log('⚠️ No se encontró el reclutamiento recién creado');
        }
        
        // Mostrar reclutamientos de hoy
        const hoy = new Date();
        const reclutamientosHoy = reclutamientos.filter(r => {
          if (!r.fecha_sesion) return false;
          const fechaSesion = new Date(r.fecha_sesion);
          return fechaSesion.toDateString() === hoy.toDateString();
        });
        
        console.log(`\n📅 Reclutamientos de hoy (${hoy.toDateString()}):`, reclutamientosHoy.length);
        reclutamientosHoy.forEach((r, index) => {
          const fechaSesion = new Date(r.fecha_sesion);
          console.log(`   ${index + 1}. ${r.nombre} - ${fechaSesion.toLocaleTimeString()} - ${r.estado_agendamiento?.nombre || 'Sin estado'}`);
        });
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Error creando reclutamiento:', error);
    }

  } catch (error) {
    console.error('❌ Error en la creación:', error);
  }
};

// Ejecutar la creación
crearReclutamientoHoy(); 