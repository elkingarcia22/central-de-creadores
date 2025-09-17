import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 [DEBUG] Verificando estructura de notas_manuales...');

    // Obtener una nota de ejemplo para ver su estructura actual
    const { data: notaEjemplo, error: notaError } = await supabaseServer
      .from('notas_manuales')
      .select('*')
      .limit(1)
      .single();

    if (notaError && notaError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error obteniendo nota ejemplo:', notaError);
      return res.status(500).json({ error: 'Error obteniendo nota ejemplo', details: notaError });
    }

    console.log('📝 [DEBUG] Nota ejemplo:', notaEjemplo);

    // Intentar actualizar una nota con 'neutral' para probar
    if (notaEjemplo) {
      console.log('🧪 [DEBUG] Probando actualización con neutral...');
      
      const { data: updateTest, error: updateError } = await supabaseServer
        .from('notas_manuales')
        .update({ semaforo_riesgo: 'neutral' })
        .eq('id', notaEjemplo.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error en prueba de actualización:', updateError);
        return res.status(500).json({ 
          error: 'Error en prueba de actualización', 
          details: updateError,
          notaEjemplo
        });
      }

      console.log('✅ [DEBUG] Prueba de actualización exitosa:', updateTest);
    }

    return res.status(200).json({
      success: true,
      notaEjemplo,
      message: 'Estructura verificada correctamente'
    });

  } catch (error) {
    console.error('❌ Error en debug:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
}
