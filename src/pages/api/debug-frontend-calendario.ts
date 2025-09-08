import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Iniciando diagnóstico del frontend del calendario');

    const { userId, investigacionId, participanteId, fechaSesion, duracionSesion } = req.body;

    // 1. Verificar que todos los campos requeridos estén presentes
    const camposRequeridos = {
      userId: userId ? 'OK' : 'FALTANTE',
      investigacionId: investigacionId ? 'OK' : 'FALTANTE',
      participanteId: participanteId ? 'OK' : 'FALTANTE',
      fechaSesion: fechaSesion ? 'OK' : 'FALTANTE',
      duracionSesion: duracionSesion ? 'OK' : 'FALTANTE'
    };

    console.log('📋 Campos recibidos:', camposRequeridos);

    // 2. Verificar que el usuario existe
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, activo')
      .eq('id', userId)
      .single();

    if (usuarioError) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return res.status(500).json({ 
        error: 'Error obteniendo usuario',
        details: usuarioError.message
      });
    }

    console.log('✅ Usuario encontrado:', usuario?.nombre);

    // 3. Verificar que la investigación existe
    const { data: investigacion, error: investigacionError } = await supabase
      .from('investigaciones')
      .select('id, nombre, estado')
      .eq('id', investigacionId)
      .single();

    if (investigacionError) {
      console.error('❌ Error obteniendo investigación:', investigacionError);
      return res.status(500).json({ 
        error: 'Error obteniendo investigación',
        details: investigacionError.message
      });
    }

    console.log('✅ Investigación encontrada:', investigacion?.nombre);

    // 4. Verificar que el participante existe
    const { data: participante, error: participanteError } = await supabase
      .from('participantes')
      .select('id, nombre, email, tipo')
      .eq('id', participanteId)
      .single();

    if (participanteError) {
      console.error('❌ Error obteniendo participante:', participanteError);
      return res.status(500).json({ 
        error: 'Error obteniendo participante',
        details: participanteError.message
      });
    }

    console.log('✅ Participante encontrado:', participante?.nombre);

    // 5. Verificar formato de fecha
    let fechaValida = false;
    try {
      const fecha = new Date(fechaSesion);
      if (!isNaN(fecha.getTime())) {
        fechaValida = true;
        console.log('✅ Fecha válida:', fecha.toISOString());
      } else {
        console.error('❌ Fecha inválida:', fechaSesion);
      }
    } catch (error) {
      console.error('❌ Error validando fecha:', error);
    }

    // 6. Verificar duración
    let duracionValida = false;
    if (duracionSesion && !isNaN(Number(duracionSesion)) && Number(duracionSesion) > 0) {
      duracionValida = true;
      console.log('✅ Duración válida:', duracionSesion);
    } else {
      console.error('❌ Duración inválida:', duracionSesion);
    }

    // 7. Probar inserción real
    let insercionExitosa = false;
    let errorInsercion = null;

    try {
      const reclutamientoData = {
        investigacion_id: investigacionId,
        participantes_id: participanteId,
        fecha_sesion: fechaSesion,
        duracion_sesion: Number(duracionSesion),
        reclutador_id: userId,
        estado_agendamiento: '7b923720-3a4e-41db-967f-0f346114f029' // Pendiente de agendamiento
      };

      console.log('📝 Datos para inserción:', reclutamientoData);

      const { data: reclutamientoInsertado, error: insertError } = await supabase
        .from('reclutamientos')
        .insert([reclutamientoData])
        .select();

      if (insertError) {
        console.error('❌ Error insertando reclutamiento:', insertError);
        errorInsercion = insertError.message;
      } else {
        console.log('✅ Reclutamiento insertado exitosamente:', reclutamientoInsertado);
        insercionExitosa = true;

        // Eliminar el reclutamiento de prueba
        if (reclutamientoInsertado && reclutamientoInsertado.length > 0) {
          await supabase
            .from('reclutamientos')
            .delete()
            .eq('id', reclutamientoInsertado[0].id);
          console.log('✅ Reclutamiento de prueba eliminado');
        }
      }
    } catch (insertTestError) {
      console.error('❌ Error en prueba de inserción:', insertTestError);
      errorInsercion = insertTestError instanceof Error ? insertTestError.message : 'Error desconocido';
    }

    res.status(200).json({
      success: true,
      message: 'Diagnóstico del frontend del calendario completado',
      resultados: {
        campos_recibidos: camposRequeridos,
        usuario_encontrado: usuario ? 'Sí' : 'No',
        investigacion_encontrada: investigacion ? 'Sí' : 'No',
        participante_encontrado: participante ? 'Sí' : 'No',
        fecha_valida: fechaValida ? 'Sí' : 'No',
        duracion_valida: duracionValida ? 'Sí' : 'No',
        insercion_exitosa: insercionExitosa ? 'Sí' : 'No',
        error_insercion: errorInsercion,
        datos_usuario: usuario,
        datos_investigacion: investigacion,
        datos_participante: participante
      }
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico del frontend:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
