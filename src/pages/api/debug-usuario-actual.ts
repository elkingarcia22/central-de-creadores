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
    console.log('🔍 Iniciando diagnóstico del usuario actual');

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID de usuario requerido',
        details: 'No se proporcionó userId en el body'
      });
    }

    console.log('👤 Verificando usuario:', userId);

    // 1. Verificar que el usuario existe en la tabla usuarios
    const { data: usuarios, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId);

    if (usuarioError) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return res.status(500).json({ 
        error: 'Error obteniendo usuario',
        details: usuarioError.message
      });
    }

    if (!usuarios || usuarios.length === 0) {
      console.error('❌ Usuario no encontrado:', userId);
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        details: `No se encontró usuario con ID: ${userId}`
      });
    }

    if (usuarios.length > 1) {
      console.error('❌ Usuario duplicado:', userId);
      return res.status(500).json({ 
        error: 'Usuario duplicado',
        details: `Se encontraron ${usuarios.length} usuarios con el mismo ID: ${userId}`,
        usuarios_duplicados: usuarios
      });
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:', usuario.nombre);

    // 2. Verificar que el usuario está activo
    const usuarioActivo = usuario.activo === true || usuario.activo === 'true';
    console.log('📊 Usuario activo:', usuarioActivo);

    // 3. Verificar estructura de la tabla usuarios
    const { data: estructuraUsuarios, error: estructuraError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);

    if (estructuraError) {
      console.error('❌ Error obteniendo estructura de usuarios:', estructuraError);
    }

    // 4. Verificar claves foráneas de reclutamientos
    const { data: clavesForaneas, error: clavesError } = await supabase
      .from('reclutamientos')
      .select('reclutador_id')
      .limit(1);

    if (clavesError) {
      console.error('❌ Error verificando claves foráneas:', clavesError);
    }

    // 5. Verificar si hay reclutamientos existentes para este usuario
    const { data: reclutamientosExistentes, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('id, fecha_sesion, reclutador_id')
      .eq('reclutador_id', userId)
      .limit(5);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos existentes:', reclutamientosError);
    }

    console.log('📊 Reclutamientos existentes:', reclutamientosExistentes?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Diagnóstico del usuario actual completado',
      resultados: {
        usuario_encontrado: 'Sí',
        usuario_activo: usuarioActivo,
        datos_usuario: usuario,
        reclutamientos_existentes: reclutamientosExistentes?.length || 0,
        estructura_usuarios: estructuraUsuarios ? 'OK' : 'Error',
        claves_foraneas: clavesForaneas ? 'OK' : 'Error',
        detalles_usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          activo: usuario.activo,
          created_at: usuario.created_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico del usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
