import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('📅 === CREANDO RECLUTAMIENTO DE PRUEBA ===\n');

    // 1. Obtener una investigación existente
    console.log('🔍 Obteniendo investigación existente...');
    const { data: investigaciones, error: errorInvestigaciones } = await supabaseServer
      .from('investigaciones')
      .select('id, titulo')
      .limit(1);

    if (errorInvestigaciones || !investigaciones || investigaciones.length === 0) {
      console.error('❌ Error obteniendo investigaciones:', errorInvestigaciones);
      return res.status(500).json({ error: 'Error obteniendo investigaciones' });
    }

    const investigacion = investigaciones[0];
    console.log(`✅ Investigación seleccionada: ${investigacion.titulo} (${investigacion.id})`);

    // 2. Obtener un participante existente
    console.log('👤 Obteniendo participante existente...');
    const { data: participantes, error: errorParticipantes } = await supabaseServer
      .from('participantes')
      .select('id, nombre')
      .limit(1);

    if (errorParticipantes || !participantes || participantes.length === 0) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return res.status(500).json({ error: 'Error obteniendo participantes' });
    }

    const participante = participantes[0];
    console.log(`✅ Participante seleccionado: ${participante.nombre} (${participante.id})`);

    // 3. Obtener un reclutador existente
    console.log('👨‍💼 Obteniendo reclutador existente...');
    const { data: usuarios, error: errorUsuarios } = await supabaseServer
      .from('usuarios')
      .select('id, full_name')
      .limit(1);

    if (errorUsuarios || !usuarios || usuarios.length === 0) {
      console.error('❌ Error obteniendo usuarios:', errorUsuarios);
      return res.status(500).json({ error: 'Error obteniendo usuarios' });
    }

    const reclutador = usuarios[0];
    console.log(`✅ Reclutador seleccionado: ${reclutador.full_name} (${reclutador.id})`);

    // 4. Obtener estado "En progreso"
    console.log('📊 Obteniendo estado "En progreso"...');
    const { data: estados, error: errorEstados } = await supabaseServer
      .from('estado_agendamiento_cat')
      .select('id, nombre')
      .eq('nombre', 'En progreso')
      .single();

    if (errorEstados || !estados) {
      console.error('❌ Error obteniendo estado "En progreso":', errorEstados);
      return res.status(500).json({ error: 'Error obteniendo estado "En progreso"' });
    }

    console.log(`✅ Estado seleccionado: ${estados.nombre} (${estados.id})`);

    // 5. Crear fecha de sesión (mañana a las 2 PM)
    const fechaSesion = new Date();
    fechaSesion.setDate(fechaSesion.getDate() + 1); // Mañana
    fechaSesion.setHours(14, 0, 0, 0); // 2 PM

    console.log(`📅 Fecha de sesión programada: ${fechaSesion.toISOString()}`);

    // 6. Crear el reclutamiento
    console.log('➕ Creando reclutamiento...');
    const { data: reclutamiento, error: errorReclutamiento } = await supabaseServer
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
      return res.status(500).json({ error: 'Error creando reclutamiento', details: errorReclutamiento });
    }

    console.log(`✅ Reclutamiento creado exitosamente: ${reclutamiento.id}`);
    console.log(`📊 Estado inicial: ${estados.nombre}`);

    // 7. Verificar que aparece en la API
    console.log('\n🔍 Verificando que aparece en la API...');
    const { data: reclutamientoVerificado, error: errorVerificacion } = await supabaseServer
      .from('vista_reclutamientos_completa')
      .select('*')
      .eq('reclutamiento_id', reclutamiento.id)
      .single();

    if (errorVerificacion) {
      console.log('⚠️ Error verificando en la vista:', errorVerificacion);
    } else {
      console.log('✅ Reclutamiento encontrado en la vista:');
      console.log(`   - Investigación: ${reclutamientoVerificado.titulo_investigacion}`);
      console.log(`   - Estado: ${reclutamientoVerificado.estado_reclutamiento_nombre}`);
      console.log(`   - Fecha sesión: ${reclutamientoVerificado.fecha_sesion}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Reclutamiento de prueba creado exitosamente',
      reclutamiento: {
        id: reclutamiento.id,
        investigacion: investigacion.titulo,
        participante: participante.nombre,
        reclutador: reclutador.full_name,
        fecha_sesion: fechaSesion.toISOString(),
        estado: estados.nombre
      }
    });

  } catch (error) {
    console.error('💥 Error general:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
