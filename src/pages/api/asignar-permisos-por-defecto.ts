import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabaseService } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🚀 Iniciando asignación de permisos por defecto...');

    // 1. PERMISOS PARA ADMINISTRADOR (TODO PERMITIDO)
    console.log('📋 Asignando permisos para Administrador...');
    const { data: adminRol, error: adminRolError } = await supabaseService
      .from('roles_plataforma')
      .select('id')
      .eq('nombre', 'Administrador')
      .single();

    if (adminRolError) {
      console.error('Error obteniendo rol Administrador:', adminRolError);
      return res.status(500).json({ error: 'Error obteniendo rol Administrador' });
    }

    const { data: funcionalidades, error: funcError } = await supabaseService
      .from('funcionalidades')
      .select('id');

    if (funcError) {
      console.error('Error obteniendo funcionalidades:', funcError);
      return res.status(500).json({ error: 'Error obteniendo funcionalidades' });
    }

    // Insertar permisos para administrador
    const permisosAdmin = funcionalidades.map(f => ({
      rol_id: adminRol.id,
      funcionalidad_id: f.id,
      permitido: true
    }));

    const { error: adminPermisosError } = await supabaseService
      .from('permisos_roles')
      .upsert(permisosAdmin, { onConflict: 'rol_id,funcionalidad_id' });

    if (adminPermisosError) {
      console.error('Error asignando permisos a Administrador:', adminPermisosError);
      return res.status(500).json({ error: 'Error asignando permisos a Administrador' });
    }

    // 2. PERMISOS PARA INVESTIGADOR
    console.log('🔬 Asignando permisos para Investigador...');
    const { data: investigadorRol, error: investigadorRolError } = await supabaseService
      .from('roles_plataforma')
      .select('id')
      .eq('nombre', 'Investigador')
      .single();

    if (!investigadorRolError && investigadorRol) {
      const { data: funcionalidadesConModulos, error: funcModError } = await supabaseService
        .from('funcionalidades')
        .select(`
          id,
          nombre,
          modulos (
            id,
            nombre
          )
        `);

      if (!funcModError && funcionalidadesConModulos) {
        const permisosInvestigador = funcionalidadesConModulos.map(f => {
          const modulo = f.modulos as any;
          let permitido = false;

          // Módulo: Investigaciones (todo permitido)
          if (modulo.nombre === 'investigaciones') permitido = true;
          // Módulo: Libretos (todo permitido)
          else if (modulo.nombre === 'libretos') permitido = true;
          // Módulo: Reclutamiento (solo lectura y ver información)
          else if (modulo.nombre === 'reclutamiento' && ['leer_reclutamiento', 'ver_informacion_investigacion', 'ver_libretos'].includes(f.nombre)) permitido = true;
          // Módulo: Seguimientos (solo lectura y métricas)
          else if (modulo.nombre === 'seguimientos' && ['leer_seguimientos', 'ver_metricas'].includes(f.nombre)) permitido = true;
          // Módulo: Usuarios (solo lectura)
          else if (modulo.nombre === 'usuarios' && ['leer_usuarios', 'ver_actividad'].includes(f.nombre)) permitido = true;
          // Módulo: Sistema (solo sistema de diseño)
          else if (modulo.nombre === 'sistema' && f.nombre === 'sistema_diseno') permitido = true;

          return {
            rol_id: investigadorRol.id,
            funcionalidad_id: f.id,
            permitido
          };
        });

        const { error: investigadorPermisosError } = await supabaseService
          .from('permisos_roles')
          .upsert(permisosInvestigador, { onConflict: 'rol_id,funcionalidad_id' });

        if (investigadorPermisosError) {
          console.error('Error asignando permisos a Investigador:', investigadorPermisosError);
        }
      }
    }

    // 3. PERMISOS PARA RECLUTADOR
    console.log('👥 Asignando permisos para Reclutador...');
    const { data: reclutadorRol, error: reclutadorRolError } = await supabaseService
      .from('roles_plataforma')
      .select('id')
      .eq('nombre', 'Reclutador')
      .single();

    if (!reclutadorRolError && reclutadorRol && funcionalidadesConModulos) {
      const permisosReclutador = funcionalidadesConModulos.map(f => {
        const modulo = f.modulos as any;
        let permitido = false;

        // Módulo: Reclutamiento (todo permitido excepto eliminar)
        if (modulo.nombre === 'reclutamiento' && f.nombre !== 'eliminar_reclutamiento') permitido = true;
        // Módulo: Investigaciones (solo lectura)
        else if (modulo.nombre === 'investigaciones' && ['leer_investigaciones', 'ver_informacion_investigacion'].includes(f.nombre)) permitido = true;
        // Módulo: Libretos (solo lectura)
        else if (modulo.nombre === 'libretos' && f.nombre === 'leer_libretos') permitido = true;
        // Módulo: Usuarios (solo lectura)
        else if (modulo.nombre === 'usuarios' && f.nombre === 'leer_usuarios') permitido = true;

        return {
          rol_id: reclutadorRol.id,
          funcionalidad_id: f.id,
          permitido
        };
      });

      const { error: reclutadorPermisosError } = await supabaseService
        .from('permisos_roles')
        .upsert(permisosReclutador, { onConflict: 'rol_id,funcionalidad_id' });

      if (reclutadorPermisosError) {
        console.error('Error asignando permisos a Reclutador:', reclutadorPermisosError);
      }
    }

    // 4. PERMISOS PARA AGENDADOR
    console.log('📅 Asignando permisos para Agendador...');
    const { data: agendadorRol, error: agendadorRolError } = await supabaseService
      .from('roles_plataforma')
      .select('id')
      .eq('nombre', 'Agendador')
      .single();

    if (!agendadorRolError && agendadorRol && funcionalidadesConModulos) {
      const permisosAgendador = funcionalidadesConModulos.map(f => {
        const modulo = f.modulos as any;
        let permitido = false;

        // Módulo: Reclutamiento (solo agendamiento y gestión de estados)
        if (modulo.nombre === 'reclutamiento' && ['leer_reclutamiento', 'asignar_agendamiento', 'gestionar_estados', 'ver_informacion_investigacion'].includes(f.nombre)) permitido = true;
        // Módulo: Investigaciones (solo lectura)
        else if (modulo.nombre === 'investigaciones' && f.nombre === 'leer_investigaciones') permitido = true;
        // Módulo: Usuarios (solo lectura)
        else if (modulo.nombre === 'usuarios' && f.nombre === 'leer_usuarios') permitido = true;

        return {
          rol_id: agendadorRol.id,
          funcionalidad_id: f.id,
          permitido
        };
      });

      const { error: agendadorPermisosError } = await supabaseService
        .from('permisos_roles')
        .upsert(permisosAgendador, { onConflict: 'rol_id,funcionalidad_id' });

      if (agendadorPermisosError) {
        console.error('Error asignando permisos a Agendador:', agendadorPermisosError);
      }
    }

    console.log('✅ Permisos por defecto asignados exitosamente');

    // Verificación final
    const { data: resumen, error: resumenError } = await supabaseService
      .from('permisos_roles')
      .select(`
        roles_plataforma (
          nombre
        ),
        funcionalidades (
          nombre,
          modulos (
            nombre
          )
        ),
        permitido
      `);

    if (resumenError) {
      console.error('Error obteniendo resumen:', resumenError);
    }

    const permisosHabilitados = resumen?.filter(p => p.permitido) || [];
    const totalPermisos = resumen?.length || 0;

    return res.status(200).json({
      success: true,
      message: 'Permisos por defecto asignados exitosamente',
      resumen: {
        total_permisos: totalPermisos,
        permisos_habilitados: permisosHabilitados.length,
        porcentaje_habilitado: totalPermisos > 0 ? Math.round((permisosHabilitados.length * 100) / totalPermisos) : 0
      },
      permisos_por_rol: permisosHabilitados.reduce((acc, p) => {
        const rolNombre = (p.roles_plataforma as any).nombre;
        const moduloNombre = (p.funcionalidades as any).modulos.nombre;
        const funcionalidadNombre = (p.funcionalidades as any).nombre;
        
        if (!acc[rolNombre]) acc[rolNombre] = {};
        if (!acc[rolNombre][moduloNombre]) acc[rolNombre][moduloNombre] = [];
        acc[rolNombre][moduloNombre].push(funcionalidadNombre);
        
        return acc;
      }, {} as Record<string, Record<string, string[]>>)
    });

  } catch (error) {
    console.error('Error ejecutando script de permisos por defecto:', error);
    return res.status(500).json({ 
      error: 'Error ejecutando script de permisos por defecto',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
