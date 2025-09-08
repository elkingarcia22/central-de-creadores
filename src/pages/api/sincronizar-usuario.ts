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
    console.log('🔍 Iniciando sincronización de usuario');

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID de usuario requerido',
        details: 'No se proporcionó userId en el body'
      });
    }

    console.log('👤 Sincronizando usuario:', userId);

    // 1. Verificar si el usuario ya existe en la tabla usuarios
    const { data: usuarioExistente, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId);

    if (usuarioError) {
      console.error('❌ Error verificando usuario existente:', usuarioError);
      return res.status(500).json({ 
        error: 'Error verificando usuario existente',
        details: usuarioError.message
      });
    }

    if (usuarioExistente && usuarioExistente.length > 0) {
      console.log('✅ Usuario ya existe en la tabla usuarios');
      return res.status(200).json({
        success: true,
        message: 'Usuario ya existe en la tabla usuarios',
        usuario: usuarioExistente[0]
      });
    }

    // 2. Verificar si el usuario existe en auth.users
    const { data: usuarioAuth, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('id', userId);

    if (authError) {
      console.error('❌ Error verificando usuario en auth:', authError);
      return res.status(500).json({ 
        error: 'Error verificando usuario en auth',
        details: authError.message
      });
    }

    if (!usuarioAuth || usuarioAuth.length === 0) {
      console.error('❌ Usuario no existe en auth.users');
      return res.status(404).json({ 
        error: 'Usuario no existe en auth.users',
        details: `No se encontró usuario con ID: ${userId} en la tabla de autenticación`
      });
    }

    const usuarioAuthData = usuarioAuth[0];
    console.log('✅ Usuario encontrado en auth.users:', usuarioAuthData.email);

    // 3. Crear usuario en la tabla usuarios
    const nuevoUsuario = {
      id: usuarioAuthData.id,
      nombre: usuarioAuthData.raw_user_meta_data?.nombre || usuarioAuthData.email,
      correo: usuarioAuthData.email,
      activo: true,
      rol_plataforma: null,
      borrado_manual: false
    };

    console.log('📝 Creando usuario en tabla usuarios:', nuevoUsuario);

    const { data: usuarioCreado, error: createError } = await supabase
      .from('usuarios')
      .insert([nuevoUsuario])
      .select();

    if (createError) {
      console.error('❌ Error creando usuario:', createError);
      return res.status(500).json({ 
        error: 'Error creando usuario',
        details: createError.message
      });
    }

    console.log('✅ Usuario creado exitosamente:', usuarioCreado);

    res.status(200).json({
      success: true,
      message: 'Usuario sincronizado exitosamente',
      usuario: usuarioCreado[0]
    });

  } catch (error) {
    console.error('❌ Error en sincronización de usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
