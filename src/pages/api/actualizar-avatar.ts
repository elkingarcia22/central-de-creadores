import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabaseService } from '../../api/supabase-server';

// Configurar límite de tamaño del body
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('API actualizar-avatar: Iniciando...');
    const { avatarBase64, userId } = req.body;

    if (!avatarBase64 || !userId) {
      console.error('API actualizar-avatar: Faltan datos requeridos', { avatarBase64: !!avatarBase64, userId });
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    console.log('API actualizar-avatar: Procesando imagen...');
    // 1. Subir avatar a Supabase Storage
    const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64');
    const avatarPath = `usuarios/${userId}/avatar.png`;
    
    console.log('API actualizar-avatar: Subiendo a storage...', { avatarPath, bufferSize: buffer.length });
    
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('avatars')
      .upload(avatarPath, buffer, {
        contentType: 'image/png',
        upsert: true,
        metadata: { user_id: userId }
      });

    if (uploadError) {
      console.error('API actualizar-avatar: Error subiendo avatar:', uploadError);
      return res.status(500).json({ error: 'Error subiendo avatar: ' + uploadError.message });
    }

    console.log('API actualizar-avatar: Avatar subido exitosamente', uploadData);

    // 2. Obtener URL pública
    const { data: urlData } = supabaseService.storage
      .from('avatars')
      .getPublicUrl(avatarPath);

    const avatarUrl = urlData.publicUrl;
    console.log('API actualizar-avatar: URL pública generada:', avatarUrl);

    // 3. Actualizar avatar_url en la tabla profiles
    console.log('API actualizar-avatar: Actualizando perfil en BD...');
    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('API actualizar-avatar: Error actualizando profile:', updateError);
      return res.status(500).json({ error: 'Error actualizando perfil: ' + updateError.message });
    }

    console.log('API actualizar-avatar: Perfil actualizado exitosamente');
    res.status(200).json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar actualizado correctamente' 
    });

  } catch (error) {
    console.error('API actualizar-avatar: Error interno:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Error desconocido') });
  }
} 