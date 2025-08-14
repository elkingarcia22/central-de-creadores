import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🚀 Ejecutando script de permisos granular...');

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // 1. INSERTAR MÓDULOS BASE
    try {
      console.log('🔧 Insertando módulos base...');
      const { error } = await supabase
        .from('modulos')
        .upsert([
          { nombre: 'investigaciones', descripcion: 'Gestión de investigaciones y estudios', orden: 1 },
          { nombre: 'reclutamiento', descripcion: 'Gestión de reclutamientos y participantes', orden: 2 },
          { nombre: 'usuarios', descripcion: 'Gestión de usuarios del sistema', orden: 3 },
          { nombre: 'sistema', descripcion: 'Configuraciones del sistema', orden: 4 },
          { nombre: 'libretos', descripcion: 'Gestión de libretos de investigación', orden: 5 },
          { nombre: 'seguimientos', descripcion: 'Gestión de seguimientos y métricas', orden: 6 }
        ], { onConflict: 'nombre' });
      
      if (error) {
        console.error('❌ Error insertando módulos:', error);
        errorCount++;
        results.push({ command: 1, status: 'error', error: error.message });
      } else {
        console.log('✅ Módulos base insertados');
        successCount++;
        results.push({ command: 1, status: 'success', message: 'Módulos base insertados' });
      }
    } catch (err) {
      console.error('❌ Error insertando módulos:', err);
      errorCount++;
      results.push({ command: 1, status: 'error', error: err instanceof Error ? err.message : 'Error desconocido' });
    }

    // 2. INSERTAR FUNCIONALIDADES
    try {
      console.log('🔧 Insertando funcionalidades...');
      
      // Obtener IDs de módulos
      const { data: modulos, error: modulosError } = await supabase
        .from('modulos')
        .select('id, nombre');
      
      if (modulosError) {
        throw modulosError;
      }

      const moduloMap = modulos.reduce((acc, modulo) => {
        acc[modulo.nombre] = modulo.id;
        return acc;
      }, {} as Record<string, string>);

      // Funcionalidades por módulo
      const funcionalidades = [
        // Investigaciones
        { modulo: 'investigaciones', nombre: 'crear', descripcion: 'Crear nuevas investigaciones', orden: 1 },
        { modulo: 'investigaciones', nombre: 'leer', descripcion: 'Ver investigaciones existentes', orden: 2 },
        { modulo: 'investigaciones', nombre: 'editar', descripcion: 'Modificar investigaciones', orden: 3 },
        { modulo: 'investigaciones', nombre: 'eliminar', descripcion: 'Eliminar investigaciones', orden: 4 },
        { modulo: 'investigaciones', nombre: 'asignar_responsable', descripcion: 'Asignar responsable de investigación', orden: 5 },
        { modulo: 'investigaciones', nombre: 'gestionar_productos', descripcion: 'Gestionar productos asociados', orden: 6 },
        { modulo: 'investigaciones', nombre: 'gestionar_periodos', descripcion: 'Gestionar períodos de investigación', orden: 7 },
        
        // Reclutamiento
        { modulo: 'reclutamiento', nombre: 'crear_reclutamiento', descripcion: 'Crear nuevos reclutamientos', orden: 1 },
        { modulo: 'reclutamiento', nombre: 'leer_reclutamiento', descripcion: 'Ver reclutamientos existentes', orden: 2 },
        { modulo: 'reclutamiento', nombre: 'editar_reclutamiento', descripcion: 'Modificar reclutamientos', orden: 3 },
        { modulo: 'reclutamiento', nombre: 'eliminar_reclutamiento', descripcion: 'Eliminar reclutamientos', orden: 4 },
        { modulo: 'reclutamiento', nombre: 'agregar_participantes', descripcion: 'Agregar participantes a reclutamientos', orden: 5 },
        { modulo: 'reclutamiento', nombre: 'asignar_agendamiento', descripcion: 'Asignar agendamientos', orden: 6 },
        { modulo: 'reclutamiento', nombre: 'gestionar_estados', descripcion: 'Gestionar estados de participantes', orden: 7 },
        { modulo: 'reclutamiento', nombre: 'ver_informacion_investigacion', descripcion: 'Ver información de investigación asociada', orden: 8 },
        { modulo: 'reclutamiento', nombre: 'ver_libretos', descripcion: 'Ver libretos de investigación', orden: 9 },
        
        // Usuarios
        { modulo: 'usuarios', nombre: 'crear_usuario', descripcion: 'Crear nuevos usuarios', orden: 1 },
        { modulo: 'usuarios', nombre: 'leer_usuarios', descripcion: 'Ver lista de usuarios', orden: 2 },
        { modulo: 'usuarios', nombre: 'editar_usuario', descripcion: 'Modificar usuarios', orden: 3 },
        { modulo: 'usuarios', nombre: 'eliminar_usuario', descripcion: 'Eliminar usuarios', orden: 4 },
        { modulo: 'usuarios', nombre: 'asignar_roles', descripcion: 'Asignar roles a usuarios', orden: 5 },
        { modulo: 'usuarios', nombre: 'gestionar_permisos', descripcion: 'Gestionar permisos de usuarios', orden: 6 },
        { modulo: 'usuarios', nombre: 'ver_actividad', descripcion: 'Ver actividad de usuarios', orden: 7 },
        
        // Sistema
        { modulo: 'sistema', nombre: 'gestionar_roles', descripcion: 'Crear y gestionar roles', orden: 1 },
        { modulo: 'sistema', nombre: 'gestionar_permisos', descripcion: 'Configurar permisos por rol', orden: 2 },
        { modulo: 'sistema', nombre: 'ver_logs', descripcion: 'Ver logs del sistema', orden: 3 },
        { modulo: 'sistema', nombre: 'configuraciones_generales', descripcion: 'Configuraciones generales', orden: 4 },
        { modulo: 'sistema', nombre: 'sistema_diseno', descripcion: 'Acceso al sistema de diseño', orden: 5 },
        
        // Libretos
        { modulo: 'libretos', nombre: 'crear_libretos', descripcion: 'Crear nuevos libretos', orden: 1 },
        { modulo: 'libretos', nombre: 'leer_libretos', descripcion: 'Ver libretos existentes', orden: 2 },
        { modulo: 'libretos', nombre: 'editar_libretos', descripcion: 'Modificar libretos', orden: 3 },
        { modulo: 'libretos', nombre: 'eliminar_libretos', descripcion: 'Eliminar libretos', orden: 4 },
        { modulo: 'libretos', nombre: 'asignar_libretos', descripcion: 'Asignar libretos a investigaciones', orden: 5 },
        
        // Seguimientos
        { modulo: 'seguimientos', nombre: 'crear_seguimiento', descripcion: 'Crear nuevos seguimientos', orden: 1 },
        { modulo: 'seguimientos', nombre: 'leer_seguimientos', descripcion: 'Ver seguimientos existentes', orden: 2 },
        { modulo: 'seguimientos', nombre: 'editar_seguimiento', descripcion: 'Modificar seguimientos', orden: 3 },
        { modulo: 'seguimientos', nombre: 'eliminar_seguimiento', descripcion: 'Eliminar seguimientos', orden: 4 },
        { modulo: 'seguimientos', nombre: 'ver_metricas', descripcion: 'Ver métricas y reportes', orden: 5 },
        { modulo: 'seguimientos', nombre: 'exportar_datos', descripcion: 'Exportar datos de seguimientos', orden: 6 }
      ];

      const funcionalidadesData = funcionalidades.map(f => ({
        modulo_id: moduloMap[f.modulo],
        nombre: f.nombre,
        descripcion: f.descripcion,
        orden: f.orden
      }));

      const { error: funcError } = await supabase
        .from('funcionalidades')
        .upsert(funcionalidadesData, { onConflict: 'modulo_id,nombre' });
      
      if (funcError) {
        console.error('❌ Error insertando funcionalidades:', funcError);
        errorCount++;
        results.push({ command: 2, status: 'error', error: funcError.message });
      } else {
        console.log('✅ Funcionalidades insertadas');
        successCount++;
        results.push({ command: 2, status: 'success', message: 'Funcionalidades insertadas' });
      }
    } catch (err) {
      console.error('❌ Error insertando funcionalidades:', err);
      errorCount++;
      results.push({ command: 2, status: 'error', error: err instanceof Error ? err.message : 'Error desconocido' });
    }

    // 3. MARCAR ROLES EXISTENTES COMO ROLES DEL SISTEMA
    try {
      console.log('🔧 Marcando roles existentes como roles del sistema...');
      const { error } = await supabase
        .from('roles_plataforma')
        .update({ es_sistema: true, activo: true })
        .in('nombre', ['Administrador', 'Agendador', 'Investigador', 'Reclutador']);
      
      if (error) {
        console.error('❌ Error marcando roles:', error);
        errorCount++;
        results.push({ command: 3, status: 'error', error: error.message });
      } else {
        console.log('✅ Roles marcados como roles del sistema');
        successCount++;
        results.push({ command: 3, status: 'success', message: 'Roles marcados como roles del sistema' });
      }
    } catch (err) {
      console.error('❌ Error marcando roles:', err);
      errorCount++;
      results.push({ command: 3, status: 'error', error: err instanceof Error ? err.message : 'Error desconocido' });
    }

    console.log(`✅ Script completado: ${successCount} exitosos, ${errorCount} errores`);

    return res.status(200).json({
      success: true,
      message: `Script ejecutado: ${successCount} comandos exitosos, ${errorCount} errores`,
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount
      },
      results
    });

  } catch (error) {
    console.error('❌ Error ejecutando script:', error);
    return res.status(500).json({
      error: 'Error ejecutando script',
      detail: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
