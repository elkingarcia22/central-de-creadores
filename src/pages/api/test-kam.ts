import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 TEST: Iniciando prueba de KAM...');
    
    // Probar consulta directa a usuarios
    console.log('🧪 TEST: Probando consulta directa a usuarios...');
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, activo')
      .eq('id', '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6')
      .single();
    
    console.log('🧪 TEST: Usuario data:', usuarioData);
    console.log('🧪 TEST: Usuario error:', usuarioError);

    // Probar consulta a profiles
    console.log('🧪 TEST: Probando consulta a profiles...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6')
      .single();
    
    console.log('🧪 TEST: Profile data:', profileData);
    console.log('🧪 TEST: Profile error:', profileError);

    // Probar consulta de empresas con KAM
    console.log('🧪 TEST: Probando consulta de empresas...');
    const { data: empresasData, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nombre, kam_id')
      .limit(1);
    
    console.log('🧪 TEST: Empresas data:', empresasData);
    console.log('🧪 TEST: Empresas error:', empresasError);

    return res.status(200).json({
      test: 'completed',
      usuario: {
        data: usuarioData,
        error: usuarioError
      },
      profile: {
        data: profileData,
        error: profileError
      },
      empresas: {
        data: empresasData,
        error: empresasError
      }
    });
  } catch (error) {
    console.error('🧪 TEST: Error general:', error);
    return res.status(500).json({ error: 'Error en test' });
  }
}
