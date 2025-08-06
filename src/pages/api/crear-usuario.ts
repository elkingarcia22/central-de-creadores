import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Esta clave debe estar en .env.local y nunca en el frontend
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { nombre, full_name, email, roles, avatarBase64 } = req.body;
  const finalName = full_name || nombre; // Soporte para ambos campos
  if (!finalName || !email || !roles || !Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    // 0. Verificar si el usuario ya existe
    const { data: existingUser } = await supabaseService.auth.admin.listUsers();
    const userExists = existingUser.users.some((user: any) => user.email === email);
    
    if (userExists) {
      return res.status(409).json({ 
        error: 'Usuario ya existe', 
        detail: 'Un usuario con este email ya está registrado en el sistema' 
      });
    }

    // 1. Crear usuario en Auth
    const { data: newUser, error: errorCreate } = await supabaseService.auth.admin.createUser({
      email,
      password: '123456',
      email_confirm: true,
      user_metadata: { full_name: finalName }
    });
    if (errorCreate || !newUser?.user?.id) {
      console.error('Error Supabase Auth:', errorCreate);
      return res.status(400).json({ error: 'Error creando usuario en autenticación', detail: errorCreate?.message });
    }
    const userId = newUser.user.id;
    // 2. Subir avatar si viene en base64
    let avatarUrl = '';
    if (avatarBase64) {
      const buffer = Buffer.from(avatarBase64.split(',')[1], 'base64');
      const avatarPath = `usuarios/${userId}/avatar.png`;
      const { data: uploadData, error: uploadError } = await supabaseService.storage
        .from('avatars')
        .upload(avatarPath, buffer, {
          contentType: 'image/png',
          upsert: true,
          metadata: { user_id: userId }
        });
      console.log('Resultado subida avatar:', { uploadData, uploadError });
      if (!uploadError) {
        avatarUrl = supabaseService.storage.from('avatars').getPublicUrl(avatarPath).data.publicUrl;
      }
    }
    // 3. Crear registro en profiles
    const { error: errorInsertProfile } = await supabaseService.from('profiles').insert([{
      id: userId,
      email,
      full_name: finalName,
      avatar_url: avatarUrl,
      created_at: new Date().toISOString(),
    }]);
    if (errorInsertProfile) {
      console.error('Error insertando en profiles:', errorInsertProfile);
      return res.status(400).json({ error: 'Error guardando usuario en la base de datos (profiles)', detail: errorInsertProfile?.message });
    }
    // 4. Insertar roles en user_roles
    for (const rolId of roles) {
      console.log('Insertando rol:', rolId, 'para usuario:', userId);
      const { error: errorUserRole } = await supabaseService.from('user_roles').insert([
        { user_id: userId, role: rolId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]);
      if (errorUserRole) {
        console.error('Error insertando rol:', errorUserRole);
        return res.status(400).json({ 
          error: 'Error asignando roles al usuario',
          detail: errorUserRole.message,
          rolId: rolId
        });
      }
    }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error inesperado', detail: err.message });
  }
} 