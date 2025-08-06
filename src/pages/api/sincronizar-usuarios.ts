import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔄 Sincronizando usuarios...');

      // 1. OBTENER USUARIOS DE LA VISTA
      console.log('📋 Obteniendo usuarios de la vista...');
      const { data: usuariosVista, error: errorVista } = await supabase
        .from('usuarios_con_roles')
        .select('*');

      if (errorVista) {
        console.error('❌ Error al obtener usuarios de la vista:', errorVista);
        return res.status(500).json({ error: 'Error al obtener usuarios de la vista', details: errorVista });
      }

      console.log('✅ Usuarios de la vista obtenidos:', usuariosVista?.length || 0);

      // 2. OBTENER USUARIOS EXISTENTES EN LA TABLA
      console.log('📋 Obteniendo usuarios existentes en la tabla...');
      const { data: usuariosExistentes, error: errorExistentes } = await supabase
        .from('usuarios')
        .select('id, correo');

      if (errorExistentes) {
        console.error('❌ Error al obtener usuarios existentes:', errorExistentes);
        return res.status(500).json({ error: 'Error al obtener usuarios existentes', details: errorExistentes });
      }

      const usuariosExistentesIds = usuariosExistentes?.map(u => u.id) || [];
      console.log('✅ Usuarios existentes:', usuariosExistentesIds);

      // 3. FILTRAR USUARIOS QUE NO EXISTEN
      const usuariosParaCrear = usuariosVista?.filter(u => !usuariosExistentesIds.includes(u.id)) || [];
      console.log('📦 Usuarios para crear:', usuariosParaCrear.length);

      if (usuariosParaCrear.length === 0) {
        console.log('✅ No hay usuarios nuevos para crear');
        return res.status(200).json({
          success: true,
          message: 'No hay usuarios nuevos para crear',
          data: {
            usuariosExistentes: usuariosExistentes?.length || 0,
            usuariosVista: usuariosVista?.length || 0,
            usuariosCreados: 0
          }
        });
      }

      // 4. CREAR USUARIOS
      console.log('👤 Creando usuarios...');
      const usuariosACrear = usuariosParaCrear.map(u => ({
        id: u.id,
        nombre: u.full_name,
        correo: u.email,
        foto_url: u.avatar_url,
        activo: true,
        rol_plataforma: null,
        borrado_manual: false
      }));

      const { data: usuariosCreados, error: errorCrear } = await supabase
        .from('usuarios')
        .insert(usuariosACrear)
        .select();

      if (errorCrear) {
        console.error('❌ Error al crear usuarios:', errorCrear);
        return res.status(500).json({ error: 'Error al crear usuarios', details: errorCrear });
      }

      console.log('✅ Usuarios creados:', usuariosCreados?.length || 0);

      // 5. VERIFICAR RESULTADO FINAL
      const { data: usuariosFinales, error: errorFinal } = await supabase
        .from('usuarios')
        .select('*');

      if (errorFinal) {
        console.error('❌ Error al verificar resultado final:', errorFinal);
        return res.status(500).json({ error: 'Error al verificar resultado final', details: errorFinal });
      }

      const resultado = {
        usuariosVista: usuariosVista?.length || 0,
        usuariosExistentes: usuariosExistentes?.length || 0,
        usuariosCreados: usuariosCreados?.length || 0,
        usuariosFinales: usuariosFinales?.length || 0,
        usuariosCreadosDetalle: usuariosCreados || [],
        resumen: {
          sincronizacionExitosa: true,
          totalUsuarios: usuariosFinales?.length || 0
        }
      };

      console.log('✅ Sincronización completada:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Usuarios sincronizados exitosamente',
        data: resultado
      });

    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 