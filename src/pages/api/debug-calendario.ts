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
    console.log('🔍 Iniciando diagnóstico del calendario');

    // 1. Verificar conexión a Supabase
    const { data: testConnection, error: testError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión a Supabase:', testError);
      return res.status(500).json({ 
        error: 'Error de conexión a Supabase',
        details: testError.message
      });
    }

    console.log('✅ Conexión a Supabase OK');

    // 2. Verificar tabla reclutamientos
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('id, fecha_sesion, duracion_sesion, reclutador_id')
      .limit(5);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message
      });
    }

    console.log('✅ Reclutamientos obtenidos:', reclutamientos?.length || 0);

    // 3. Verificar tabla investigaciones
    const { data: investigaciones, error: investigacionesError } = await supabase
      .from('investigaciones')
      .select('id, nombre, estado')
      .limit(5);

    if (investigacionesError) {
      console.error('❌ Error obteniendo investigaciones:', investigacionesError);
      return res.status(500).json({ 
        error: 'Error obteniendo investigaciones',
        details: investigacionesError.message
      });
    }

    console.log('✅ Investigaciones obtenidas:', investigaciones?.length || 0);

    // 4. Verificar tabla participantes
    const { data: participantes, error: participantesError } = await supabase
      .from('participantes')
      .select('id, nombre, email, tipo')
      .limit(5);

    if (participantesError) {
      console.error('❌ Error obteniendo participantes:', participantesError);
      return res.status(500).json({ 
        error: 'Error obteniendo participantes',
        details: participantesError.message
      });
    }

    console.log('✅ Participantes obtenidos:', participantes?.length || 0);

    // 5. Verificar tabla usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, activo')
      .limit(5);

    if (usuariosError) {
      console.error('❌ Error obteniendo usuarios:', usuariosError);
      return res.status(500).json({ 
        error: 'Error obteniendo usuarios',
        details: usuariosError.message
      });
    }

    console.log('✅ Usuarios obtenidos:', usuarios?.length || 0);

    // 6. Verificar permisos RLS
    const { data: rlsTest, error: rlsError } = await supabase
      .from('reclutamientos')
      .select('*')
      .limit(1);

    if (rlsError) {
      console.error('❌ Error de permisos RLS:', rlsError);
      return res.status(500).json({ 
        error: 'Error de permisos RLS',
        details: rlsError.message
      });
    }

    console.log('✅ Permisos RLS OK');

    // 7. Probar inserción de reclutamiento de prueba
    try {
      const reclutamientoPrueba = {
        investigacion_id: investigaciones?.[0]?.id || 'test-id',
        participantes_id: participantes?.[0]?.id || 'test-id',
        fecha_sesion: new Date().toISOString(),
        duracion_sesion: 60,
        reclutador_id: usuarios?.[0]?.id || 'test-id',
        estado_agendamiento: '7b923720-3a4e-41db-967f-0f346114f029'
      };

      const { data: insertTest, error: insertError } = await supabase
        .from('reclutamientos')
        .insert([reclutamientoPrueba])
        .select();

      if (insertError) {
        console.error('❌ Error insertando reclutamiento de prueba:', insertError);
        return res.status(500).json({ 
          error: 'Error insertando reclutamiento de prueba',
          details: insertError.message
        });
      }

      console.log('✅ Inserción de reclutamiento de prueba exitosa');

      // Eliminar el reclutamiento de prueba
      if (insertTest && insertTest.length > 0) {
        await supabase
          .from('reclutamientos')
          .delete()
          .eq('id', insertTest[0].id);
        console.log('✅ Reclutamiento de prueba eliminado');
      }

    } catch (insertTestError) {
      console.error('❌ Error en prueba de inserción:', insertTestError);
      return res.status(500).json({ 
        error: 'Error en prueba de inserción',
        details: insertTestError instanceof Error ? insertTestError.message : 'Error desconocido'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnóstico del calendario completado exitosamente',
      resultados: {
        conexion_supabase: 'OK',
        reclutamientos_obtenidos: reclutamientos?.length || 0,
        investigaciones_obtenidas: investigaciones?.length || 0,
        participantes_obtenidos: participantes?.length || 0,
        usuarios_obtenidos: usuarios?.length || 0,
        permisos_rls: 'OK',
        insercion_prueba: 'OK',
        datos_reclutamientos: reclutamientos,
        datos_investigaciones: investigaciones,
        datos_participantes: participantes,
        datos_usuarios: usuarios
      }
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico del calendario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
