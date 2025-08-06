import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Esta clave debe estar en .env.local y nunca en el frontend
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId } = req.query;
  
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    console.log('Eliminando usuario:', userId);

    // 1. Eliminar roles del usuario
    const { error: errorUserRoles } = await supabaseService
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (errorUserRoles) {
      console.error('Error eliminando roles del usuario:', errorUserRoles);
      return res.status(400).json({ 
        error: 'Error eliminando roles del usuario', 
        detail: errorUserRoles.message 
      });
    }

    // 2. Eliminar perfil del usuario
    const { error: errorProfile } = await supabaseService
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (errorProfile) {
      console.error('Error eliminando perfil del usuario:', errorProfile);
      return res.status(400).json({ 
        error: 'Error eliminando perfil del usuario', 
        detail: errorProfile.message 
      });
    }

    // 3. Eliminar usuario de Auth
    const { error: errorAuth } = await supabaseService.auth.admin.deleteUser(userId);

    if (errorAuth) {
      console.error('Error eliminando usuario de Auth:', errorAuth);
      // No retornamos error aquí porque el usuario ya fue eliminado de las tablas
      // Solo logueamos el error para debugging
    }

    // 4. Eliminar avatar si existe
    try {
      const { data: avatarFiles, error: listError } = await supabaseService.storage
        .from('avatars')
        .list(`usuarios/${userId}`);

      if (!listError && avatarFiles && avatarFiles.length > 0) {
        for (const file of avatarFiles) {
          await supabaseService.storage
            .from('avatars')
            .remove([`usuarios/${userId}/${file.name}`]);
        }
      }
    } catch (avatarError) {
      console.error('Error eliminando avatar:', avatarError);
      // No es crítico si falla la eliminación del avatar
    }

    console.log('Usuario eliminado exitosamente:', userId);
    return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' });

  } catch (err: any) {
    console.error('Error inesperado eliminando usuario:', err);
    return res.status(500).json({ 
      error: 'Error inesperado eliminando usuario', 
      detail: err.message 
    });
  }
} 