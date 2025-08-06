import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { reclutamiento_id, fecha_sesion, duracion_sesion } = req.body;

    if (!reclutamiento_id) {
      return res.status(400).json({ error: 'ID de reclutamiento requerido' });
    }

    console.log('🔍 === PRUEBA DE ACTUALIZACIÓN ===');
    console.log('🔍 ID:', reclutamiento_id);
    console.log('🔍 Fecha sesión:', fecha_sesion);
    console.log('🔍 Duración:', duracion_sesion);

    // Preparar datos para actualizar
    const datosParaActualizar: any = {
      updated_at: new Date().toISOString()
    };

    if (fecha_sesion !== undefined) datosParaActualizar.fecha_sesion = fecha_sesion;
    if (duracion_sesion !== undefined) datosParaActualizar.duracion_sesion = duracion_sesion;

    console.log('🔍 Datos a actualizar:', datosParaActualizar);

    // Verificar que el reclutamiento existe
    const { data: reclutamientoExistente, error: errorExistente } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('id', reclutamiento_id)
      .single();

    if (errorExistente || !reclutamientoExistente) {
      console.error('❌ Reclutamiento no encontrado:', errorExistente);
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    console.log('✅ Reclutamiento encontrado:', reclutamientoExistente);

    // Actualizar el reclutamiento
    const { data, error } = await supabase
      .from('reclutamientos')
      .update(datosParaActualizar)
      .eq('id', reclutamiento_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Actualización exitosa:', data);

    return res.status(200).json({
      success: true,
      message: 'Prueba de actualización exitosa',
      data: {
        antes: reclutamientoExistente,
        despues: data
      }
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 