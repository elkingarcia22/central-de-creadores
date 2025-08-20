import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 TEST: Verificando estructura de empresas...');
    
    // 1. Obtener estructura de la tabla empresas
    const { data: empresasRaw, error: empresasError } = await supabase
      .from('empresas')
      .select('*')
      .limit(1);
    
    console.log('🔍 TEST: Estructura empresas raw:', empresasRaw);
    console.log('🔍 TEST: Error empresas:', empresasError);

    // 2. Obtener empresas con joins
    const { data: empresasWithJoins, error: joinsError } = await supabase
      .from('empresas')
      .select(`
        *,
        pais_info:paises!empresas_pais_fkey(
          id,
          nombre
        ),
        industria_info:industrias!empresas_industria_fkey(
          id,
          nombre
        ),
        estado_info:estado_empresa!fk_empresas_estado(
          id,
          nombre
        ),
        tamano_info:tamano_empresa!fk_empresas_tamano(
          id,
          nombre
        ),
        modalidad_info:modalidades!fk_empresas_modalidad(
          id,
          nombre
        ),
        relacion_info:relacion_empresa!fk_empresas_relacion(
          id,
          nombre
        ),
        producto_info:productos!empresas_producto_id_fkey(
          id,
          nombre
        )
      `)
      .limit(1);
    
    console.log('🔍 TEST: Empresas con joins:', empresasWithJoins);
    console.log('🔍 TEST: Error joins:', joinsError);

    // 3. Verificar KAM específico
    if (empresasRaw && empresasRaw.length > 0) {
      const kamId = empresasRaw[0].kam_id;
      console.log('🔍 TEST: KAM ID encontrado:', kamId);
      
      const { data: kamData, error: kamError } = await supabase
        .from('usuarios')
        .select('id, nombre, correo')
        .eq('id', kamId)
        .single();
      
      console.log('🔍 TEST: KAM data:', kamData);
      console.log('🔍 TEST: KAM error:', kamError);
    }

    return res.status(200).json({
      test: 'completed',
      empresasRaw: empresasRaw,
      empresasWithJoins: empresasWithJoins,
      errors: {
        empresas: empresasError,
        joins: joinsError
      }
    });
  } catch (error) {
    console.error('🔍 TEST: Error general:', error);
    return res.status(500).json({ error: 'Error en test' });
  }
}
