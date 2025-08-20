import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔒 TEST RLS: Verificando permisos en tabla usuarios...');
    
    // 1. Probar consulta simple a usuarios
    const { data: usuariosSimple, error: errorSimple } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .limit(1);
    
    console.log('🔒 TEST RLS: Usuarios simple:', usuariosSimple);
    console.log('🔒 TEST RLS: Error simple:', errorSimple);

    // 2. Probar consulta con filtro específico
    const { data: usuarioEspecifico, error: errorEspecifico } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .eq('id', '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6')
      .single();
    
    console.log('🔒 TEST RLS: Usuario específico:', usuarioEspecifico);
    console.log('🔒 TEST RLS: Error específico:', errorEspecifico);

    // 3. Probar consulta con IN
    const { data: usuariosIn, error: errorIn } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .in('id', ['9b1ef1eb-fdb4-410f-ab22-bfedc68294d6']);
    
    console.log('🔒 TEST RLS: Usuarios IN:', usuariosIn);
    console.log('🔒 TEST RLS: Error IN:', errorIn);

    // 4. Probar consulta a profiles (que sabemos que funciona)
    const { data: profiles, error: errorProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6')
      .single();
    
    console.log('🔒 TEST RLS: Profile:', profiles);
    console.log('🔒 TEST RLS: Error profiles:', errorProfiles);

    return res.status(200).json({
      test: 'completed',
      usuariosSimple: {
        data: usuariosSimple,
        error: errorSimple
      },
      usuarioEspecifico: {
        data: usuarioEspecifico,
        error: errorEspecifico
      },
      usuariosIn: {
        data: usuariosIn,
        error: errorIn
      },
      profiles: {
        data: profiles,
        error: errorProfiles
      }
    });
  } catch (error) {
    console.error('🔒 TEST RLS: Error general:', error);
    return res.status(500).json({ error: 'Error en test RLS' });
  }
}
