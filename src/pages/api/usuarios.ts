import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Usar la tabla usuarios como fuente única de verdad
    console.log('🔍 Iniciando consulta a tabla usuarios (fuente única)...');
    
    let { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id, 
        nombre, 
        correo, 
        foto_url,
        rol_plataforma
      `)
      .eq('activo', true)
      .order('nombre');
    
    console.log('🔍 Resultado de consulta:', { usuarios: usuarios?.length || 0, error });

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return res.status(500).json({ error: error.message });
    }

    // Verificar inconsistencias con profiles (solo para reporte)
    if (usuarios && usuarios.length > 0) {
      const { data: profilesCheck, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', usuarios.map(u => u.id));
      
      if (!profilesError && profilesCheck) {
        const inconsistencias = usuarios.filter(u => {
          const profile = profilesCheck.find(p => p.id === u.id);
          return !profile || profile.full_name !== u.nombre || profile.email !== u.correo;
        });
        
        if (inconsistencias.length > 0) {
          console.warn('⚠️ Inconsistencias detectadas entre usuarios y profiles:', inconsistencias.length);
        }
      }
    }

    // Convertir datos de usuarios al formato esperado por el componente
    const usuariosFormateados = usuarios?.map(user => ({
      id: user.id,
      full_name: user.nombre || 'Sin nombre',
      email: user.correo,
      avatar_url: user.foto_url,
      roles: user.rol_plataforma || [],
      created_at: new Date().toISOString()
    })) || [];

    // Formatear la respuesta como espera el componente
    return res.status(200).json({
      usuarios: usuariosFormateados || [],
      total: usuariosFormateados?.length || 0,
      fuente: 'usuarios',
      mensaje: 'Usando tabla usuarios como fuente única de verdad'
    });

  } catch (error) {
    console.error('Error en /api/usuarios:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      usuarios: [],
      total: 0
    });
  }
} 