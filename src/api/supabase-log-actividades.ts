import { supabase } from './supabase';

// ====================================
// API PARA LOG DE ACTIVIDADES DE INVESTIGACIONES
// ====================================

export interface ActividadLog {
  id: string;
  tipo_actividad: string;
  descripcion: string;
  detalles: any;
  usuario_nombre: string;
  usuario_email: string;
  creado_el: string;
}

export interface CrearActividadLogParams {
  investigacion_id: string;
  tipo_actividad: string;
  descripcion: string;
  detalles?: any;
}

// Función para obtener el log de actividades de una investigación
export const obtenerLogActividades = async (investigacionId: string): Promise<{
  data: ActividadLog[] | null;
  error: string | null;
}> => {
  try {
    console.log('🔍 Obteniendo log de actividades para investigación:', investigacionId);
    
    const { data, error } = await supabase
      .from('log_actividades_investigacion')
      .select(`
        id,
        tipo_actividad,
        descripcion,
        detalles,
        usuario_nombre,
        usuario_email,
        creado_el
      `)
      .eq('investigacion_id', investigacionId)
      .order('creado_el', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo log de actividades:', error);
      return { data: null, error: error.message };
    }
    
    console.log('✅ Log de actividades obtenido:', data?.length || 0, 'registros');
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error inesperado obteniendo log de actividades:', error);
    return { data: null, error: error.message || 'Error inesperado' };
  }
};

// Función para crear manualmente un registro de actividad
export const crearActividadLog = async (params: CrearActividadLogParams): Promise<{
  data: string | null;
  error: string | null;
}> => {
  try {
    console.log('📝 Creando registro de actividad:', params);
    
    const { data, error } = await supabase
      .rpc('registrar_actividad_investigacion', {
        p_investigacion_id: params.investigacion_id,
        p_tipo_actividad: params.tipo_actividad,
        p_descripcion: params.descripcion,
        p_detalles: params.detalles || {}
      });
    
    if (error) {
      console.error('❌ Error creando registro de actividad:', error);
      return { data: null, error: error.message };
    }
    
    console.log('✅ Registro de actividad creado:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error inesperado creando registro de actividad:', error);
    return { data: null, error: error.message || 'Error inesperado' };
  }
};

// Función para obtener estadísticas del log de actividades
export const obtenerEstadisticasLog = async (investigacionId: string): Promise<{
  data: {
    total_actividades: number;
    ultima_actividad: string | null;
    actividades_por_tipo: Record<string, number>;
    usuarios_activos: string[];
  } | null;
  error: string | null;
}> => {
  try {
    console.log('📊 Obteniendo estadísticas del log para investigación:', investigacionId);
    
    // Obtener todas las actividades
    const { data: actividades, error } = await supabase
      .from('log_actividades_investigacion')
      .select('tipo_actividad, usuario_nombre, creado_el')
      .eq('investigacion_id', investigacionId)
      .order('creado_el', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { data: null, error: error.message };
    }
    
    if (!actividades || actividades.length === 0) {
      return {
        data: {
          total_actividades: 0,
          ultima_actividad: null,
          actividades_por_tipo: {},
          usuarios_activos: []
        },
        error: null
      };
    }
    
    // Calcular estadísticas
    const actividades_por_tipo: Record<string, number> = {};
    const usuarios_unicos = new Set<string>();
    
    actividades.forEach(actividad => {
      // Contar por tipo
      actividades_por_tipo[actividad.tipo_actividad] = 
        (actividades_por_tipo[actividad.tipo_actividad] || 0) + 1;
      
      // Usuarios únicos
      if (actividad.usuario_nombre) {
        usuarios_unicos.add(actividad.usuario_nombre);
      }
    });
    
    const estadisticas = {
      total_actividades: actividades.length,
      ultima_actividad: actividades[0]?.creado_el || null,
      actividades_por_tipo,
      usuarios_activos: Array.from(usuarios_unicos)
    };
    
    console.log('✅ Estadísticas obtenidas:', estadisticas);
    return { data: estadisticas, error: null };
  } catch (error: any) {
    console.error('❌ Error inesperado obteniendo estadísticas:', error);
    return { data: null, error: error.message || 'Error inesperado' };
  }
};

// Función para limpiar log antiguo (para administradores)
export const limpiarLogAntiguo = async (investigacionId: string, diasAntiguedad: number = 90): Promise<{
  data: number | null;
  error: string | null;
}> => {
  try {
    console.log('🧹 Limpiando log antiguo para investigación:', investigacionId, 'días:', diasAntiguedad);
    
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);
    
    const { data, error } = await supabase
      .from('log_actividades_investigacion')
      .delete()
      .eq('investigacion_id', investigacionId)
      .lt('creado_el', fechaLimite.toISOString())
      .select('id');
    
    if (error) {
      console.error('❌ Error limpiando log antiguo:', error);
      return { data: null, error: error.message };
    }
    
    const registrosEliminados = data?.length || 0;
    console.log('✅ Log antiguo limpiado:', registrosEliminados, 'registros eliminados');
    return { data: registrosEliminados, error: null };
  } catch (error: any) {
    console.error('❌ Error inesperado limpiando log antiguo:', error);
    return { data: null, error: error.message || 'Error inesperado' };
  }
}; 