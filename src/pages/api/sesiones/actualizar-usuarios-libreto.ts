import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { investigacion_id, usuarios_participantes } = req.body;

    if (!investigacion_id) {
      return res.status(400).json({ error: 'investigacion_id es requerido' });
    }

    console.log('🔄 Actualizando sesiones con usuarios del libreto para investigación:', investigacion_id);
    console.log('👥 Usuarios participantes del libreto:', usuarios_participantes);

    // Obtener todas las sesiones de reclutamiento para esta investigación
    const { data: sesiones, error: sesionesError } = await supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        reclutador_id,
        fecha_sesion,
        estado_agendamiento
      `)
      .eq('investigacion_id', investigacion_id);

    if (sesionesError) {
      console.error('❌ Error obteniendo sesiones:', sesionesError);
      return res.status(500).json({ error: 'Error obteniendo sesiones', details: sesionesError.message });
    }

    if (!sesiones || sesiones.length === 0) {
      console.log('ℹ️ No hay sesiones para actualizar');
      return res.status(200).json({ 
        success: true,
        message: 'No hay sesiones para actualizar',
        sesiones_actualizadas: 0
      });
    }

    console.log(`📊 Encontradas ${sesiones.length} sesiones para actualizar`);

    // Actualizar cada sesión con los usuarios del libreto
    let sesionesActualizadas = 0;
    const errores = [];

    for (const sesion of sesiones) {
      try {
        // Crear un campo para almacenar los usuarios del libreto en la sesión
        // Podemos usar un campo JSON o crear una tabla de relación
        // Por ahora, vamos a usar un campo JSON en la tabla reclutamientos
        
        const { error: updateError } = await supabaseServer
          .from('reclutamientos')
          .update({ 
            usuarios_libreto: usuarios_participantes || null,
            actualizado_el: new Date().toISOString()
          })
          .eq('id', sesion.id);

        if (updateError) {
          console.error(`❌ Error actualizando sesión ${sesion.id}:`, updateError);
          errores.push({
            sesion_id: sesion.id,
            error: updateError.message
          });
        } else {
          console.log(`✅ Sesión ${sesion.id} actualizada exitosamente`);
          sesionesActualizadas++;
        }
      } catch (error) {
        console.error(`❌ Error procesando sesión ${sesion.id}:`, error);
        errores.push({
          sesion_id: sesion.id,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    console.log(`✅ Proceso completado: ${sesionesActualizadas}/${sesiones.length} sesiones actualizadas`);

    return res.status(200).json({ 
      success: true,
      message: `Sesiones actualizadas exitosamente`,
      sesiones_actualizadas,
      total_sesiones: sesiones.length,
      errores: errores.length > 0 ? errores : undefined
    });

  } catch (error) {
    console.error('❌ Error en actualizar-usuarios-libreto:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
