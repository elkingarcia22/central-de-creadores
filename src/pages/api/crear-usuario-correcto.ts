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
    console.log('🔍 Iniciando creación de usuario correcto');

    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ 
        error: 'ID de usuario y email requeridos',
        details: 'No se proporcionó userId o email en el body'
      });
    }

    console.log('👤 Creando usuario correcto:', userId, 'con email:', email);

    // 1. Verificar si el usuario ya existe con el ID correcto
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
      console.log('✅ Usuario ya existe con el ID correcto');
      return res.status(200).json({
        success: true,
        message: 'Usuario ya existe con el ID correcto',
        usuario: usuarioExistente[0]
      });
    }

    // 2. Crear usuario con el ID correcto
    const nuevoUsuario = {
      id: userId,
      nombre: email,
      correo: email,
      activo: true,
      rol_plataforma: null,
      borrado_manual: false
    };

    console.log('📝 Creando usuario con ID correcto:', nuevoUsuario);

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
      message: 'Usuario creado exitosamente con el ID correcto',
      usuario: usuarioCreado[0]
    });

  } catch (error) {
    console.error('❌ Error en creación de usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
