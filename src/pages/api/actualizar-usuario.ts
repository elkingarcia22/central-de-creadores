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
    console.log('🔍 Iniciando actualización de usuario');

    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ 
        error: 'ID de usuario y email requeridos',
        details: 'No se proporcionó userId o email en el body'
      });
    }

    console.log('👤 Actualizando usuario:', userId, 'con email:', email);

    // 1. Verificar si el usuario existe en la tabla usuarios con el email
    const { data: usuarioExistente, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', email);

    if (usuarioError) {
      console.error('❌ Error verificando usuario existente:', usuarioError);
      return res.status(500).json({ 
        error: 'Error verificando usuario existente',
        details: usuarioError.message
      });
    }

    if (!usuarioExistente || usuarioExistente.length === 0) {
      console.error('❌ Usuario no existe en la tabla usuarios');
      return res.status(404).json({ 
        error: 'Usuario no existe en la tabla usuarios',
        details: `No se encontró usuario con email: ${email}`
      });
    }

    const usuarioActual = usuarioExistente[0];
    console.log('✅ Usuario encontrado en usuarios:', usuarioActual.id);

    // 2. Verificar si ya tiene el ID correcto
    if (usuarioActual.id === userId) {
      console.log('✅ Usuario ya tiene el ID correcto');
      return res.status(200).json({
        success: true,
        message: 'Usuario ya tiene el ID correcto',
        usuario: usuarioActual
      });
    }

    // 3. Actualizar el usuario con el ID correcto
    console.log('📝 Actualizando usuario con ID correcto:', userId);

    const { data: usuarioActualizado, error: updateError } = await supabase
      .from('usuarios')
      .update({
        id: userId,
        activo: true,
        borrado_manual: false
      })
      .eq('correo', email)
      .select();

    if (updateError) {
      console.error('❌ Error actualizando usuario:', updateError);
      return res.status(500).json({ 
        error: 'Error actualizando usuario',
        details: updateError.message
      });
    }

    console.log('✅ Usuario actualizado exitosamente:', usuarioActualizado);

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado[0]
    });

  } catch (error) {
    console.error('❌ Error en actualización de usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
