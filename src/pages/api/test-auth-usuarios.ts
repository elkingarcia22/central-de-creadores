import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔐 TEST AUTH: Verificando autenticación y consulta de usuarios...');
    
    // 1. Verificar el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 TEST AUTH: Usuario actual:', user);
    console.log('🔐 TEST AUTH: Error auth:', authError);

    // 2. Probar consulta simple a usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .limit(3);
    
    console.log('🔐 TEST AUTH: Usuarios encontrados:', usuarios);
    console.log('🔐 TEST AUTH: Error usuarios:', usuariosError);

    // 3. Probar consulta específica al KAM
    const { data: kam, error: kamError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .eq('id', '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6')
      .single();
    
    console.log('🔐 TEST AUTH: KAM específico:', kam);
    console.log('🔐 TEST AUTH: Error KAM:', kamError);

    // 4. Probar consulta con IN
    const { data: usuariosIn, error: usuariosInError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .in('id', ['9b1ef1eb-fdb4-410f-ab22-bfedc68294d6']);
    
    console.log('🔐 TEST AUTH: Usuarios IN:', usuariosIn);
    console.log('🔐 TEST AUTH: Error usuarios IN:', usuariosInError);

    return res.status(200).json({
      test: 'completed',
      auth: {
        user: user,
        error: authError
      },
      usuarios: {
        data: usuarios,
        error: usuariosError
      },
      kam: {
        data: kam,
        error: kamError
      },
      usuariosIn: {
        data: usuariosIn,
        error: usuariosInError
      }
    });
  } catch (error) {
    console.error('🔐 TEST AUTH: Error general:', error);
    return res.status(500).json({ error: 'Error en test auth' });
  }
}
