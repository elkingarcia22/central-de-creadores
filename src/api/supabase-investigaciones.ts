import { supabase } from './supabase';
import { 
  Investigacion, 
  InvestigacionFormData,
  Periodo,
  Producto,
  TipoInvestigacion,
  Usuario,
  EstadoReclutamiento,
  RiesgoCategoria,
  RespuestaAPI,
  validarInvestigacion
} from '../types/supabase-investigaciones';
import { restaurarSeguimientoDesdeInvestigacion, actualizarSeguimientoPorInvestigacionCompletada } from './supabase-seguimientos';

// ====================================
// FUNCIONES PARA CATÁLOGOS
// ====================================

export const obtenerEstadosInvestigacion = async (): Promise<RespuestaAPI<Array<{value: string, label: string}>>> => {
  try {
    console.log('🔍 Obteniendo estados de investigación desde enum...');
    
    // Consultar los valores del enum directamente
    const { data, error } = await supabase
      .rpc('get_enum_values', { enum_name: 'enum_estado_investigacion' });

    if (error) {
      console.log('⚠️ Error obteniendo estados de investigación:', error.message);
      throw error;
    }

    console.log('✅ Estados de investigación obtenidos:', data);
    
    // Estados que queremos excluir
    const estadosExcluidos = ['por agenda'];
    
    // Filtrar y mapear los valores a formato de opciones para selects
    const estadosFormateados = (data || [])
      .filter((estado: string) => !estadosExcluidos.includes(estado))
      .map((estado: string) => ({
        value: estado,
        label: formatearLabelEstado(estado)
      }));

    return {
      data: estadosFormateados,
      mensaje: 'Estados de investigación obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo estados de investigación:', error);
    
    // Fallback a valores predeterminados si hay error
    const estadosFallback = [
      { value: 'en_borrador', label: 'En Borrador' },
      { value: 'por_iniciar', label: 'Por Iniciar' },
      { value: 'en_progreso', label: 'En Progreso' },
      { value: 'finalizado', label: 'Finalizado' },
      { value: 'pausado', label: 'Pausado' },
      { value: 'cancelado', label: 'Cancelado' },
      { value: 'deprecado', label: 'Deprecado' }
    ];
    
    return {
      data: estadosFallback,
      error: error.message || 'Error obteniendo estados, usando valores predeterminados'
    };
  }
};

// Función auxiliar para formatear labels de estados
const formatearLabelEstado = (estado: string): string => {
  const labels: Record<string, string> = {
    'borrador': 'Borrador',
    'en_borrador': 'En Borrador',
    'por_iniciar': 'Por Iniciar',
    'en_progreso': 'En Progreso',
    'finalizado': 'Finalizado',
    'pausado': 'Pausado',
    'cancelado': 'Cancelado',
    'deprecado': 'Deprecado'
  };
  
  return labels[estado] || estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, ' ');
};

export const obtenerPeriodos = async (): Promise<RespuestaAPI<Periodo[]>> => {
  try {
    console.log('🔍 Obteniendo períodos desde Supabase...');
    const { data, error } = await supabase
      .from('periodo')
      .select('*')
      .order('etiqueta');

    if (error) {
      console.log('⚠️ Error obteniendo períodos:', error.message);
      throw error;
    }

    console.log('✅ Períodos obtenidos:', data?.length || 0);
    return {
      data: data || [],
      mensaje: 'Períodos obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo períodos:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo períodos'
    };
  }
};

export const obtenerProductos = async (): Promise<RespuestaAPI<Producto[]>> => {
  try {
    console.log('🔍 Obteniendo productos desde Supabase...');
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre');

    if (error) {
      console.log('⚠️ Error obteniendo productos:', error.message);
      throw error;
    }

    console.log('✅ Productos obtenidos:', data?.length || 0);
    return {
      data: data || [],
      mensaje: 'Productos obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo productos:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo productos'
    };
  }
};

export const obtenerTiposInvestigacion = async (): Promise<RespuestaAPI<TipoInvestigacion[]>> => {
  try {
    console.log('🔍 Obteniendo tipos de investigación desde Supabase...');
    const { data, error } = await supabase
      .from('tipos_investigacion')
      .select('*')
      .order('nombre');

    if (error) {
      console.log('⚠️ Error obteniendo tipos de investigación:', error.message);
      throw error;
    }

    console.log('✅ Tipos de investigación obtenidos:', data?.length || 0);
    return {
      data: data || [],
      mensaje: 'Tipos de investigación obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo tipos de investigación:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo tipos de investigación'
    };
  }
};

export const obtenerUsuarios = async (): Promise<RespuestaAPI<Usuario[]>> => {
  try {
    console.log('🔍 Obteniendo usuarios desde vista usuarios_con_roles...');
    // Usar la vista usuarios_con_roles para traer todos los usuarios de la plataforma
    const { data, error } = await supabase
      .from('usuarios_con_roles')
      .select('id, full_name, email, avatar_url, roles, created_at')
      .order('email', { nullsFirst: false });

    if (error) {
      console.log('⚠️ Error obteniendo usuarios:', error.message);
      throw error;
    }

    // Formatear datos para que coincidan con la interfaz Usuario
    const usuariosFormateados = (data || []).map(user => ({
      id: user.id,
      full_name: user.full_name || user.email || 'Sin nombre',
      email: user.email || 'sin-email@ejemplo.com',
      avatar_url: user.avatar_url || null,
      roles: user.roles || [],
      created_at: user.created_at || null
    }));

    console.log('✅ Usuarios obtenidos desde vista usuarios_con_roles:', usuariosFormateados.length);
    return {
      data: usuariosFormateados,
      mensaje: 'Usuarios obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo usuarios:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo usuarios'
    };
  }
};

export const obtenerEstadosReclutamiento = async (): Promise<RespuestaAPI<Array<{value: string, label: string}>>> => {
  try {
    console.log('🔍 Obteniendo estados de reclutamiento desde tabla...');
    
    const { data: estados, error } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre, activo')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.log('⚠️ Error obteniendo estados de reclutamiento:', error.message);
      throw error;
    }

    console.log('✅ Estados de reclutamiento obtenidos:', estados);
    
    // Mapear los valores a formato de opciones para selects
    const estadosFormateados = (estados || []).map((estado: any) => ({
      value: estado.id,
      label: estado.nombre || 'Sin nombre'
    }));

    return {
      data: estadosFormateados,
      mensaje: 'Estados de reclutamiento obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('❌ Error obteniendo estados de reclutamiento:', error);
    return {
      data: [],
      error: error.message || 'Error al obtener estados de reclutamiento',
      mensaje: 'Error al obtener estados de reclutamiento'
    };
  }
};

export const obtenerCategoriasRiesgo = async (): Promise<RespuestaAPI<RiesgoCategoria[]>> => {
  try {
    const { data, error } = await supabase
      .from('riesgo_cat')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return {
      data: data || [],
      mensaje: 'Categorías de riesgo obtenidas exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo categorías de riesgo:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo categorías de riesgo'
    };
  }
};

// ====================================
// FUNCIONES PARA ESTADOS DE RECLUTAMIENTO
// ====================================

// ====================================
// FUNCIONES PRINCIPALES - INVESTIGACIONES
// ====================================

export const obtenerInvestigaciones = async (usuarioId?: string, esAdmin: boolean = false): Promise<RespuestaAPI<Investigacion[]>> => {
  try {
    console.log('🔍 Obteniendo investigaciones con datos relacionados...');
    console.log('👤 Usuario ID:', usuarioId, 'Es Admin:', esAdmin);
    
    // ESTRATEGIA 1: Consulta básica con filtros de asignación
    let query = supabase
      .from('investigaciones')
      .select('*');
    
    // Aplicar filtros de asignación si no es administrador
    if (!esAdmin && usuarioId) {
      console.log('🔒 Aplicando filtros de asignación para usuario:', usuarioId);
      query = query.or(`responsable_id.eq.${usuarioId},implementador_id.eq.${usuarioId},creado_por.eq.${usuarioId}`);
    }
    
    const { data: investigaciones, error } = await query.order('creado_el', { ascending: false });

    if (error) {
      console.error('❌ Error en consulta principal:', error);
      throw error;
    }

    console.log('✅ Investigaciones base obtenidas:', investigaciones?.length || 0);

    if (!investigaciones || investigaciones.length === 0) {
      console.log('⚠️ No se encontraron investigaciones');
      return {
        data: [],
        error: null
      };
    }

    // ESTRATEGIA 2: Enriquecer datos con consultas separadas
    console.log('🔄 Enriqueciendo datos con consultas separadas...');
    
    // Obtener datos de productos
    const { data: productos } = await supabase
      .from('productos')
      .select('id, nombre');
    
    // Obtener datos de tipos de investigación
    const { data: tiposInvestigacion } = await supabase
      .from('tipos_investigacion')
      .select('id, nombre');
      
    // Obtener datos de períodos
    const { data: periodos } = await supabase
      .from('periodo')
      .select('id, nombre, etiqueta');
      
    // Obtener datos de usuarios
    const { data: usuarios } = await supabase
      .from('usuarios_con_roles')
      .select('id, full_name, email, avatar_url');

    console.log('📊 Datos auxiliares obtenidos:', {
      productos: productos?.length || 0,
      tiposInvestigacion: tiposInvestigacion?.length || 0,
      periodos: periodos?.length || 0,
      usuarios: usuarios?.length || 0
    });

    // Crear mapas para búsqueda rápida
    const productosMap = new Map(productos?.map(p => [p.id, p]) || []);
    const tiposMap = new Map(tiposInvestigacion?.map(t => [t.id, t]) || []);
    const periodosMap = new Map(periodos?.map(p => [p.id, p]) || []);
    const usuariosMap = new Map(usuarios?.map(u => [u.id, u]) || []);

    // Mapear los datos con información real
    const investigacionesMapeadas = investigaciones.map((inv: any) => {
      const producto = productosMap.get(inv.producto_id) as any;
      const tipoInvestigacion = tiposMap.get(inv.tipo_investigacion_id) as any;
      const periodo = periodosMap.get(inv.periodo_id) as any;
      const responsable = usuariosMap.get(inv.responsable_id) as any;
      const implementador = usuariosMap.get(inv.implementador_id) as any;
      const creador = usuariosMap.get(inv.creado_por) as any;
      
      // DEBUG: Log detallado del mapeo
      console.log(`🔍 Mapeando investigación ${inv.id}:`, {
        nombre: inv.nombre,
        producto_id: inv.producto_id,
        producto_encontrado: producto?.nombre || 'NO ENCONTRADO',
        tipo_investigacion_id: inv.tipo_investigacion_id,
        tipo_encontrado: tipoInvestigacion?.nombre || 'NO ENCONTRADO',
        responsable_id: inv.responsable_id,
        responsable_encontrado: responsable?.full_name || 'NO ENCONTRADO'
      });
      
      const investigacionMapeada = {
        id: inv.id,
        nombre: inv.nombre,
        fecha_inicio: inv.fecha_inicio,
        fecha_fin: inv.fecha_fin,
        periodo_id: inv.periodo_id,
        producto_id: inv.producto_id,
        responsable_id: inv.responsable_id,
        tipo_investigacion_id: inv.tipo_investigacion_id,
        estado_reclutamiento: inv.estado_reclutamiento,
        riesgo: inv.riesgo,
        libreto: inv.libreto,
        tipo_prueba: inv.tipo_prueba,
        plataforma: inv.plataforma,
        link_prueba: inv.link_prueba,
        link_resultados: inv.link_resultados,
        fecha_seguimiento: inv.fecha_seguimiento,
        notas_seguimiento: inv.notas_seguimiento,
        creado_por: inv.creado_por,
        creado_el: inv.creado_el,
        actualizado_el: inv.actualizado_el,
        implementador_id: inv.implementador_id,
        estado: inv.estado,
        tipo_sesion: inv.tipo_sesion,
        riesgo_automatico: inv.riesgo_automatico,
        
        // Campos con datos reales de las tablas relacionadas
        tipo_investigacion_nombre: tipoInvestigacion?.nombre || 'Sin tipo',
        responsable_nombre: responsable?.full_name || 'Sin asignar',
        responsable_email: responsable?.email || null,
        implementador_nombre: implementador?.full_name || null,
        implementador_email: implementador?.email || null,
        creado_por_nombre: creador?.full_name || null,
        creado_por_email: creador?.email || null,
        periodo_nombre: periodo?.nombre || periodo?.etiqueta || null,
        producto_nombre: producto?.nombre || null,
        
        // Objetos estructurados para compatibilidad con la UI
        responsable: inv.responsable_id ? {
          id: inv.responsable_id,
          name: responsable?.full_name || 'Sin nombre',
          email: responsable?.email || null,
          avatar_url: responsable?.avatar_url || null
        } : null,
        implementador: inv.implementador_id ? {
          id: inv.implementador_id,
          name: implementador?.full_name || 'Sin nombre',
          email: implementador?.email || null,
          avatar_url: implementador?.avatar_url || null
        } : null,
        creador: inv.creado_por ? {
          id: inv.creado_por,
          name: creador?.full_name || 'Sin nombre',
          email: creador?.email || null,
          avatar_url: creador?.avatar_url || null
        } : null,
        periodo: inv.periodo_id ? {
          id: inv.periodo_id,
          nombre: periodo?.nombre || periodo?.etiqueta || 'Sin nombre'
        } : null,
        producto: inv.producto_id ? {
          id: inv.producto_id,
          nombre: producto?.nombre || 'Sin nombre'
        } : null,
        tipo_investigacion: inv.tipo_investigacion_id ? {
          id: inv.tipo_investigacion_id,
          nombre: tipoInvestigacion?.nombre || 'Sin nombre'
        } : null
      };

      console.log(`📄 Investigación mapeada final:`, {
        id: investigacionMapeada.id,
        nombre: investigacionMapeada.nombre,
        tipo_investigacion_nombre: investigacionMapeada.tipo_investigacion_nombre,
        producto_nombre: investigacionMapeada.producto_nombre,
        responsable_nombre: investigacionMapeada.responsable_nombre
      });

      return investigacionMapeada;
    });

    console.log('✅ Investigaciones mapeadas correctamente:', investigacionesMapeadas.length);
    console.log('📊 Primera investigación mapeada:', investigacionesMapeadas[0]);

    return {
      data: investigacionesMapeadas,
      error: null
    };

  } catch (error) {
    console.error('❌ Error completo al obtener investigaciones:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Error desconocido al obtener investigaciones'
    };
  }
};

export const obtenerInvestigacionPorId = async (id: string): Promise<RespuestaAPI<Investigacion>> => {
  try {
    console.log('🔍 Obteniendo investigación por ID:', id);
    
    // ESTRATEGIA 1: Consulta básica primero
    const { data: investigacion, error } = await supabase
      .from('investigaciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error obteniendo investigación:', error);
      throw error;
    }

    if (!investigacion) {
      return {
        data: {} as Investigacion,
        error: 'Investigación no encontrada'
      };
    }

    console.log('✅ Investigación base obtenida:', investigacion.nombre);

    // ESTRATEGIA 2: Enriquecer datos con consultas separadas (igual que obtenerInvestigaciones)
    console.log('🔄 Enriqueciendo datos con consultas separadas...');
    
    // Obtener datos de productos
    const { data: productos } = await supabase
      .from('productos')
      .select('id, nombre');
    
    // Obtener datos de tipos de investigación
    const { data: tiposInvestigacion } = await supabase
      .from('tipos_investigacion')
      .select('id, nombre');
      
    // Obtener datos de períodos
    const { data: periodos } = await supabase
      .from('periodo')
      .select('id, nombre, etiqueta');
      
    // Obtener datos de usuarios
    const { data: usuarios } = await supabase
      .from('usuarios_con_roles')
      .select('id, full_name, email, avatar_url');

    // Crear mapas para búsqueda rápida
    const productosMap = new Map(productos?.map(p => [p.id, p]) || []);
    const tiposMap = new Map(tiposInvestigacion?.map(t => [t.id, t]) || []);
    const periodosMap = new Map(periodos?.map(p => [p.id, p]) || []);
    const usuariosMap = new Map(usuarios?.map(u => [u.id, u]) || []);

    // Mapear los datos con información real (igual que obtenerInvestigaciones)
    const producto = productosMap.get(investigacion.producto_id) as any;
    const tipoInvestigacion = tiposMap.get(investigacion.tipo_investigacion_id) as any;
    const periodo = periodosMap.get(investigacion.periodo_id) as any;
    const responsable = usuariosMap.get(investigacion.responsable_id) as any;
    const implementador = usuariosMap.get(investigacion.implementador_id) as any;
    const creador = usuariosMap.get(investigacion.creado_por) as any;

    const investigacionFormateada = {
      id: investigacion.id,
      nombre: investigacion.nombre,
      fecha_inicio: investigacion.fecha_inicio,
      fecha_fin: investigacion.fecha_fin,
      periodo_id: investigacion.periodo_id,
      producto_id: investigacion.producto_id,
      responsable_id: investigacion.responsable_id,
      tipo_investigacion_id: investigacion.tipo_investigacion_id,
      estado_reclutamiento: investigacion.estado_reclutamiento,
      riesgo: investigacion.riesgo,
      libreto: investigacion.libreto,
      tipo_prueba: investigacion.tipo_prueba,
      plataforma: investigacion.plataforma,
      link_prueba: investigacion.link_prueba,
      link_resultados: investigacion.link_resultados,
      fecha_seguimiento: investigacion.fecha_seguimiento,
      notas_seguimiento: investigacion.notas_seguimiento,
      creado_por: investigacion.creado_por,
      creado_el: investigacion.creado_el,
      actualizado_el: investigacion.actualizado_el,
      implementador_id: investigacion.implementador_id,
      estado: investigacion.estado,
      tipo_sesion: investigacion.tipo_sesion,
      riesgo_automatico: investigacion.riesgo_automatico,
      
      // Campos con datos reales de las tablas relacionadas
      tipo_investigacion_nombre: tipoInvestigacion?.nombre || 'Sin tipo',
      responsable_nombre: responsable?.full_name || 'Sin asignar',
      responsable_email: responsable?.email || null,
      implementador_nombre: implementador?.full_name || null,
      implementador_email: implementador?.email || null,
      creado_por_nombre: creador?.full_name || null,
      creado_por_email: creador?.email || null,
      periodo_nombre: periodo?.nombre || periodo?.etiqueta || null,
      producto_nombre: producto?.nombre || null,
      
      // Objetos estructurados para compatibilidad con la UI
      responsable: investigacion.responsable_id ? {
        id: investigacion.responsable_id,
        name: responsable?.full_name || 'Sin nombre',
        email: responsable?.email || null,
        avatar_url: responsable?.avatar_url || null
      } : null,
      implementador: investigacion.implementador_id ? {
        id: investigacion.implementador_id,
        name: implementador?.full_name || 'Sin nombre',
        email: implementador?.email || null,
        avatar_url: implementador?.avatar_url || null
      } : null,
      creador: investigacion.creado_por ? {
        id: investigacion.creado_por,
        name: creador?.full_name || 'Sin nombre',
        email: creador?.email || null,
        avatar_url: creador?.avatar_url || null
      } : null,
      periodo: investigacion.periodo_id ? {
        id: investigacion.periodo_id,
        nombre: periodo?.nombre || periodo?.etiqueta || 'Sin nombre'
      } : null,
      producto: investigacion.producto_id ? {
        id: investigacion.producto_id,
        nombre: producto?.nombre || 'Sin nombre'
      } : null,
      tipo_investigacion: investigacion.tipo_investigacion_id ? {
        id: investigacion.tipo_investigacion_id,
        nombre: tipoInvestigacion?.nombre || 'Sin nombre'
      } : null
    };

    console.log('✅ Investigación formateada exitosamente');

    return {
      data: investigacionFormateada,
      mensaje: 'Investigación obtenida exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo investigación:', error);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error obteniendo investigación'
    };
  }
};

export const crearInvestigacion = async (datos: InvestigacionFormData): Promise<RespuestaAPI<Investigacion>> => {
  try {
    console.log('🔍 Datos recibidos para crear investigación:', datos);
    
    // Validar datos
    const errores = validarInvestigacion(datos);
    if (errores.length > 0) {
      console.log('❌ Errores de validación:', errores);
      return {
        data: {} as Investigacion,
        error: errores.join(', ')
      };
    }

    // Obtener el usuario actual para creado_por
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Usuario actual:', user?.id);
    
    // Preparar datos para insertar
    const datosParaInsertar = {
      nombre: datos.nombre.trim(),
      fecha_inicio: datos.fecha_inicio,
      fecha_fin: datos.fecha_fin,
      producto_id: datos.producto_id,
      tipo_investigacion_id: datos.tipo_investigacion_id,
      periodo_id: datos.periodo_id || null,
      responsable_id: datos.responsable_id || null,
      implementador_id: datos.implementador_id || null,
      estado: datos.estado || 'en_borrador',
      tipo_prueba: datos.tipo_prueba || null,
      plataforma: datos.plataforma || null,
      tipo_sesion: datos.tipo_sesion || null,
      libreto: datos.libreto || null,
      link_prueba: datos.link_prueba || null,
      link_resultados: datos.link_resultados || null,
      notas_seguimiento: datos.notas_seguimiento || null,
      creado_por: user?.id || null
    };

    console.log('📝 Datos preparados para insertar:', datosParaInsertar);
    console.log('🔍 IDs específicos a verificar:', {
      producto_id: datosParaInsertar.producto_id,
      tipo_investigacion_id: datosParaInsertar.tipo_investigacion_id,
      periodo_id: datosParaInsertar.periodo_id,
      responsable_id: datosParaInsertar.responsable_id,
      implementador_id: datosParaInsertar.implementador_id,
      creado_por: datosParaInsertar.creado_por
    });

    // 🚨 VALIDAR USUARIOS EN TABLA PROFILES (tabla base de usuarios_con_roles)
    if (datosParaInsertar.responsable_id) {
      const { data: responsable } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', datosParaInsertar.responsable_id)
        .single();

      if (!responsable) {
        console.error('❌ Responsable no existe en tabla profiles:', datosParaInsertar.responsable_id);
        throw new Error('El responsable seleccionado no es válido');
      } else {
        console.log('✅ Responsable válido:', datosParaInsertar.responsable_id);
      }
    }

    if (datosParaInsertar.implementador_id) {
      const { data: implementador } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', datosParaInsertar.implementador_id)
        .single();

      if (!implementador) {
        console.error('❌ Implementador no existe en tabla profiles:', datosParaInsertar.implementador_id);
        throw new Error('El implementador seleccionado no es válido');
      } else {
        console.log('✅ Implementador válido:', datosParaInsertar.implementador_id);
      }
    }

    if (datosParaInsertar.creado_por) {
      const { data: creador } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', datosParaInsertar.creado_por)
        .single();

      if (!creador) {
        console.error('❌ Creador no existe en tabla profiles:', datosParaInsertar.creado_por);
        throw new Error('El usuario creador no es válido');
      } else {
        console.log('✅ Creador válido:', datosParaInsertar.creado_por);
      }
    }

    const { data, error } = await supabase
      .from('investigaciones')
      .insert([datosParaInsertar])
      .select('*')
      .single();

    if (error) {
      console.log('❌ Error insertando investigación:', error);
      console.log('�� Código de error:', error.code);
      console.log('🔍 Mensaje de error:', error.message);
      console.log('🔍 Detalles del error:', error.details);
      console.log('🔍 Hint del error:', error.hint);
      throw error;
    }
    
    console.log('✅ Investigación creada exitosamente:', data);

    console.log('✅ Investigación creada exitosamente, obteniendo datos completos...');

    // Obtener la investigación completa desde la vista que ya incluye todos los datos relacionados
    const investigacionCompleta = await obtenerInvestigacionPorId(data.id);
    
    if (investigacionCompleta.error) {
      console.log('⚠️ Error obteniendo datos completos, usando datos básicos');
      return {
        data: data,
        mensaje: 'Investigación creada exitosamente (datos básicos)'
      };
    }

    const investigacionFormateada = investigacionCompleta.data;

    return {
      data: investigacionFormateada,
      mensaje: 'Investigación creada exitosamente'
    };
  } catch (error: any) {
    console.error('Error creando investigación:', error);
    
    // Manejo específico de errores 500 (problemas de servidor)
    let mensajeError = error.message || 'Error creando investigación';
    
    if (error.code === 'PGRST500' || error.status === 500) {
      mensajeError = 'Error en el servidor de base de datos. Posible problema con triggers o funciones. Contacta al administrador.';
    } else if (error.code === '23505') {
      mensajeError = 'Ya existe una investigación con esos datos. Verifica que no sea duplicada.';
    } else if (error.code === '23503') {
      mensajeError = 'Error de referencia: El producto o tipo de investigación seleccionado no es válido.';
    } else if (error.code === '42501') {
      mensajeError = 'No tienes permisos para crear investigaciones. Contacta al administrador.';
    }
    
    return {
      data: {} as Investigacion,
      error: mensajeError
    };
  }
};

export const actualizarInvestigacion = async (id: string, datos: Partial<InvestigacionFormData>): Promise<RespuestaAPI<Investigacion>> => {
  try {
    console.log('🔍 === INICIO ACTUALIZAR INVESTIGACIÓN ===');
    console.log('🔍 ID de investigación:', id);
    console.log('🔍 Datos recibidos:', datos);
    
    // Preparar datos para actualizar (solo campos que no son null/undefined)
    const datosParaActualizar: any = {};
    
    if (datos.nombre !== undefined) datosParaActualizar.nombre = datos.nombre.trim();
    if (datos.fecha_inicio !== undefined) datosParaActualizar.fecha_inicio = datos.fecha_inicio;
    if (datos.fecha_fin !== undefined) datosParaActualizar.fecha_fin = datos.fecha_fin;
    if (datos.producto_id !== undefined) datosParaActualizar.producto_id = datos.producto_id;
    if (datos.tipo_investigacion_id !== undefined) datosParaActualizar.tipo_investigacion_id = datos.tipo_investigacion_id;
    if (datos.periodo_id !== undefined) datosParaActualizar.periodo_id = datos.periodo_id;
    if (datos.responsable_id !== undefined) datosParaActualizar.responsable_id = datos.responsable_id;
    if (datos.implementador_id !== undefined) datosParaActualizar.implementador_id = datos.implementador_id;
    if (datos.estado !== undefined) datosParaActualizar.estado = datos.estado;
    if (datos.tipo_prueba !== undefined) datosParaActualizar.tipo_prueba = datos.tipo_prueba;
    if (datos.plataforma !== undefined) datosParaActualizar.plataforma = datos.plataforma;
    if (datos.tipo_sesion !== undefined) datosParaActualizar.tipo_sesion = datos.tipo_sesion;
    if (datos.libreto !== undefined) datosParaActualizar.libreto = datos.libreto;
    if (datos.link_prueba !== undefined) datosParaActualizar.link_prueba = datos.link_prueba;
    if (datos.link_resultados !== undefined) datosParaActualizar.link_resultados = datos.link_resultados;
    if (datos.notas_seguimiento !== undefined) datosParaActualizar.notas_seguimiento = datos.notas_seguimiento;

    // Agregar timestamp de actualización
    datosParaActualizar.actualizado_el = new Date().toISOString();

    console.log('📝 Datos preparados para actualizar:', datosParaActualizar);
    console.log('🔍 Campos a actualizar:', Object.keys(datosParaActualizar));

    const { data, error } = await supabase
      .from('investigaciones')
      .update(datosParaActualizar)
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error en consulta de actualización:', error);
      console.error('❌ Código de error:', error.code);
      console.error('❌ Mensaje de error:', error.message);
      console.error('❌ Detalles del error:', error.details);
      throw error;
    }

    console.log('✅ Investigación actualizada exitosamente:', data);

    // VERIFICAR SI LA INVESTIGACIÓN SE COMPLETÓ Y ACTUALIZAR SEGUIMIENTOS RELACIONADOS
    if (datos.estado === 'finalizado') {
      console.log('🎯 Investigación marcada como finalizada, actualizando seguimientos relacionados...');
      const { data: seguimientosActualizados, error: seguimientosError } = await actualizarSeguimientoPorInvestigacionCompletada(id);
      
      if (seguimientosError) {
        console.warn('⚠️ Error actualizando seguimientos relacionados, pero la investigación se actualizó correctamente:', seguimientosError);
      } else if (seguimientosActualizados && seguimientosActualizados.length > 0) {
        console.log('✅ Seguimientos actualizados a completado:', seguimientosActualizados.length);
      } else {
        console.log('ℹ️ No había seguimientos relacionados para actualizar');
      }
    }

    // Obtener la investigación completa desde la vista
    console.log('🔍 Obteniendo investigación completa...');
    const investigacionCompleta = await obtenerInvestigacionPorId(id);
    
    if (investigacionCompleta.error) {
      console.error('❌ Error obteniendo investigación completa:', investigacionCompleta.error);
      throw new Error(investigacionCompleta.error);
    }

    const investigacionFormateada = investigacionCompleta.data;
    console.log('✅ Investigación completa obtenida:', investigacionFormateada.nombre);

    console.log('🔍 === FIN ACTUALIZAR INVESTIGACIÓN ===');

    return {
      data: investigacionFormateada,
      mensaje: 'Investigación actualizada exitosamente'
    };
  } catch (error: any) {
    console.error('❌ === ERROR EN ACTUALIZAR INVESTIGACIÓN ===');
    console.error('Error actualizando investigación:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje de error:', error.message);
    console.error('Detalles del error:', error.details);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error actualizando investigación'
    };
  }
};

export const eliminarInvestigacion = async (id: string): Promise<RespuestaAPI<boolean>> => {
  try {
    console.log('🗑️ Eliminando investigación:', id);
    
    // PRIMERO: Restaurar seguimientos relacionados
    console.log('🔄 Restaurando seguimientos relacionados...');
    const { data: seguimientosRestaurados, error: restaurarError } = await restaurarSeguimientoDesdeInvestigacion(id);
    
    if (restaurarError) {
      console.warn('⚠️ Error restaurando seguimientos, pero continuando con eliminación:', restaurarError);
    } else if (seguimientosRestaurados && seguimientosRestaurados > 0) {
      console.log('✅ Seguimientos restaurados:', seguimientosRestaurados);
    } else {
      console.log('ℹ️ No había seguimientos para restaurar');
    }

    // SEGUNDO: Eliminar la investigación
    const { error } = await supabase
      .from('investigaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Investigación eliminada exitosamente');
    return {
      data: true,
      mensaje: 'Investigación eliminada exitosamente'
    };
  } catch (error: any) {
    console.error('Error eliminando investigación:', error);
    return {
      data: false,
      error: error.message || 'Error eliminando investigación'
    };
  }
};

// ====================================
// FUNCIONES ESPECÍFICAS PARA LINKS
// ====================================

export const actualizarLinkPrueba = async (id: string, linkPrueba: string): Promise<RespuestaAPI<Investigacion>> => {
  try {
    const { data, error } = await supabase
      .from('investigaciones')
      .update({ 
        link_prueba: linkPrueba.trim(),
        actualizado_el: new Date().toISOString()
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;

    // Obtener la investigación completa
    const investigacionCompleta = await obtenerInvestigacionPorId(id);
    
    if (investigacionCompleta.error) {
      throw new Error(investigacionCompleta.error);
    }

    return {
      data: investigacionCompleta.data,
      mensaje: 'Link de prueba actualizado exitosamente'
    };
  } catch (error: any) {
    console.error('Error actualizando link de prueba:', error);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error actualizando link de prueba'
    };
  }
};

export const eliminarLinkPrueba = async (id: string): Promise<RespuestaAPI<Investigacion>> => {
  try {
    const { data, error } = await supabase
      .from('investigaciones')
      .update({ 
        link_prueba: null,
        actualizado_el: new Date().toISOString()
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;

    // Obtener la investigación completa
    const investigacionCompleta = await obtenerInvestigacionPorId(id);
    
    if (investigacionCompleta.error) {
      throw new Error(investigacionCompleta.error);
    }

    return {
      data: investigacionCompleta.data,
      mensaje: 'Link de prueba eliminado exitosamente'
    };
  } catch (error: any) {
    console.error('Error eliminando link de prueba:', error);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error eliminando link de prueba'
    };
  }
};

export const actualizarLinkResultados = async (id: string, linkResultados: string): Promise<RespuestaAPI<Investigacion>> => {
  try {
    const { data, error } = await supabase
      .from('investigaciones')
      .update({ 
        link_resultados: linkResultados.trim(),
        actualizado_el: new Date().toISOString()
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;

    // Obtener la investigación completa
    const investigacionCompleta = await obtenerInvestigacionPorId(id);
    
    if (investigacionCompleta.error) {
      throw new Error(investigacionCompleta.error);
    }

    return {
      data: investigacionCompleta.data,
      mensaje: 'Link de resultados actualizado exitosamente'
    };
  } catch (error: any) {
    console.error('Error actualizando link de resultados:', error);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error actualizando link de resultados'
    };
  }
};

export const eliminarLinkResultados = async (id: string): Promise<RespuestaAPI<Investigacion>> => {
  try {
    const { data, error } = await supabase
      .from('investigaciones')
      .update({ 
        link_resultados: null,
        actualizado_el: new Date().toISOString()
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;

    // Obtener la investigación completa
    const investigacionCompleta = await obtenerInvestigacionPorId(id);
    
    if (investigacionCompleta.error) {
      throw new Error(investigacionCompleta.error);
    }

    return {
      data: investigacionCompleta.data,
      mensaje: 'Link de resultados eliminado exitosamente'
    };
  } catch (error: any) {
    console.error('Error eliminando link de resultados:', error);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error eliminando link de resultados'
    };
  }
};

// ====================================
// FUNCIONES ESPECÍFICAS PARA LIBRETO
// ====================================

export const actualizarLibreto = async (id: string, libreto: string): Promise<RespuestaAPI<Investigacion>> => {
  try {
    const { data, error } = await supabase
      .from('investigaciones')
      .update({ 
        libreto: libreto.trim(),
        actualizado_el: new Date().toISOString()
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;

    // Obtener la investigación completa
    const investigacionCompleta = await obtenerInvestigacionPorId(id);
    
    if (investigacionCompleta.error) {
      throw new Error(investigacionCompleta.error);
    }

    return {
      data: investigacionCompleta.data,
      mensaje: 'Libreto actualizado exitosamente'
    };
  } catch (error: any) {
    console.error('Error actualizando libreto:', error);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error actualizando libreto'
    };
  }
};

export const eliminarLibreto = async (id: string): Promise<RespuestaAPI<Investigacion>> => {
  try {
    const { data, error } = await supabase
      .from('investigaciones')
      .update({ 
        libreto: null,
        actualizado_el: new Date().toISOString()
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;

    // Obtener la investigación completa
    const investigacionCompleta = await obtenerInvestigacionPorId(id);
    
    if (investigacionCompleta.error) {
      throw new Error(investigacionCompleta.error);
    }

    return {
      data: investigacionCompleta.data,
      mensaje: 'Libreto eliminado exitosamente'
    };
  } catch (error: any) {
    console.error('Error eliminando libreto:', error);
    return {
      data: {} as Investigacion,
      error: error.message || 'Error eliminando libreto'
    };
  }
}; 