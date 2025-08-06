import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Iniciando diagnóstico completo de usuarios y empresas...');

      // 1. VERIFICAR TABLA USUARIOS
      console.log('👥 Verificando tabla usuarios...');
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('*')
        .limit(10);

      // 2. VERIFICAR VISTA USUARIOS_CON_ROLES
      console.log('👥 Verificando vista usuarios_con_roles...');
      const { data: usuariosConRoles, error: errorUsuariosConRoles } = await supabase
        .from('usuarios_con_roles')
        .select('*')
        .limit(10);

      // 3. VERIFICAR TABLA EMPRESAS
      console.log('🏢 Verificando tabla empresas...');
      const { data: empresas, error: errorEmpresas } = await supabase
        .from('empresas')
        .select('*');

      // 4. VERIFICAR TABLA PARTICIPANTES_INTERNOS
      console.log('👥 Verificando tabla participantes_internos...');
      const { data: participantesInternos, error: errorParticipantesInternos } = await supabase
        .from('participantes_internos')
        .select('*')
        .limit(10);

      // 5. PREPARAR DIAGNÓSTICO
      const diagnostico = {
        tablaUsuarios: {
          data: usuarios || [],
          error: errorUsuarios,
          count: usuarios?.length || 0
        },
        vistaUsuariosConRoles: {
          data: usuariosConRoles || [],
          error: errorUsuariosConRoles,
          count: usuariosConRoles?.length || 0
        },
        tablaEmpresas: {
          data: empresas || [],
          error: errorEmpresas,
          count: empresas?.length || 0
        },
        tablaParticipantesInternos: {
          data: participantesInternos || [],
          error: errorParticipantesInternos,
          count: participantesInternos?.length || 0
        },
        resumen: {
          hayUsuarios: (usuarios && usuarios.length > 0),
          hayUsuariosConRoles: (usuariosConRoles && usuariosConRoles.length > 0),
          hayEmpresas: (empresas && empresas.length > 0),
          hayParticipantesInternos: (participantesInternos && participantesInternos.length > 0)
        }
      };

      console.log('✅ Diagnóstico completado:', diagnostico.resumen);

      return res.status(200).json({
        success: true,
        message: 'Diagnóstico completado exitosamente',
        data: diagnostico
      });

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 