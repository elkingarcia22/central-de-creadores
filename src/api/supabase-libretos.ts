import { supabase } from './supabase';
import { 
  LibretoInvestigacion, 
  LibretoFormData, 
  RespuestaAPILibreto,
  Plataforma,
  RolEmpresa,
  Industria,
  Modalidad,
  TamanoEmpresa,
  TipoPrueba,
  Pais
} from '../types/libretos';

// ====================================
// FUNCIONES PARA OBTENER CATÁLOGOS
// ====================================

export const obtenerPlataformas = async (): Promise<RespuestaAPILibreto<Plataforma[]>> => {
  try {
    const { data, error } = await supabase
      .from('plataformas_cat')
      .select('*')
      .order('nombre');

    if (error) throw error;

    return {
      data: data || [],
      mensaje: 'Plataformas obtenidas exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo plataformas:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo plataformas'
    };
  }
};

export const obtenerTiposPrueba = async (): Promise<RespuestaAPILibreto<TipoPrueba[]>> => {
  try {
    console.log('🔍 Iniciando consulta a tipos_prueba_cat...');
    
    const { data, error } = await supabase
      .from('tipos_prueba_cat')
      .select('*')
      .order('nombre');

    console.log('📊 Resultado de la consulta tipos_prueba_cat:', {
      data: data,
      error: error,
      dataLength: data?.length || 0,
      dataType: typeof data,
      isArray: Array.isArray(data)
    });

    if (error) {
      console.error('❌ Error en la consulta tipos_prueba_cat:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ La tabla tipos_prueba_cat existe pero está vacía o no accesible');
      return {
        data: [],
        mensaje: 'La tabla tipos_prueba_cat está vacía o no accesible'
      };
    }

    console.log('✅ Tipos de prueba cargados exitosamente:', data.length, 'tipos');
    console.log('✅ Datos de tipos de prueba:', data);
    return {
      data: data || [],
      mensaje: 'Tipos de prueba obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('💥 Error obteniendo tipos de prueba:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo tipos de prueba'
    };
  }
};

export const obtenerRolesEmpresa = async (): Promise<RespuestaAPILibreto<RolEmpresa[]>> => {
  try {
    console.log('🔍 Iniciando consulta a roles_empresa...');
    
    const { data, error } = await supabase
      .from('roles_empresa')
      .select('*')
      .order('nombre');

    console.log('📊 Resultado de la consulta roles_empresa:', {
      data: data,
      error: error,
      dataLength: data?.length || 0,
      dataType: typeof data,
      isArray: Array.isArray(data),
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details
    });

    if (error) {
      console.error('❌ Error en la consulta roles_empresa:', error);
      console.error('❌ Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ La tabla roles_empresa existe pero está vacía o no accesible');
      console.warn('⚠️ Posibles causas:', {
        rls_habilitado: 'RLS puede estar bloqueando el acceso',
        permisos_usuario: 'El usuario actual no tiene permisos',
        tabla_vacia: 'La tabla realmente está vacía',
        filtros_activos: 'Hay filtros que ocultan los datos'
      });
      return {
        data: [],
        mensaje: 'La tabla roles_empresa está vacía o no accesible'
      };
    }

    console.log('✅ Roles de empresa cargados exitosamente:', data.length, 'roles');
    console.log('✅ Primeros 3 roles:', data.slice(0, 3));
    return {
      data: data || [],
      mensaje: 'Roles de empresa obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('💥 Error obteniendo roles de empresa:', error);
    console.error('💥 Stack trace:', error.stack);
    return {
      data: [],
      error: error.message || 'Error obteniendo roles de empresa'
    };
  }
};

export const obtenerIndustrias = async (): Promise<RespuestaAPILibreto<Industria[]>> => {
  try {
    const { data, error } = await supabase
      .from('industrias')
      .select('*')
      .order('nombre');

    if (error) throw error;

    return {
      data: data || [],
      mensaje: 'Industrias obtenidas exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo industrias:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo industrias'
    };
  }
};

export const obtenerPaises = async (): Promise<RespuestaAPILibreto<Pais[]>> => {
  try {
    console.log('�� Iniciando consulta a paises...');
    
    const { data, error } = await supabase
      .from('paises')
      .select('*')
      .order('nombre');

    console.log('📊 Resultado de la consulta paises:', {
      data: data,
      error: error,
      dataLength: data?.length || 0,
      dataType: typeof data,
      isArray: Array.isArray(data)
    });

    if (error) {
      console.error('❌ Error en la consulta paises:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ La tabla paises existe pero está vacía o no accesible');
      return {
        data: [],
        mensaje: 'La tabla paises está vacía o no accesible'
      };
    }

    console.log('✅ Países cargados exitosamente:', data.length, 'países');
    console.log('✅ Primeros 5 países:', data.slice(0, 5));
    return {
      data: data || [],
      mensaje: 'Países obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('💥 Error obteniendo países:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo países'
    };
  }
};

export const obtenerModalidades = async (): Promise<RespuestaAPILibreto<Modalidad[]>> => {
  try {
    console.log('🔍 Iniciando consulta a modalidades...');
    
    const { data, error } = await supabase
      .from('modalidades')
      .select('*')
      .order('nombre');

    console.log('📊 Resultado de la consulta modalidades:', {
      data: data,
      error: error,
      dataLength: data?.length || 0,
      dataType: typeof data,
      isArray: Array.isArray(data)
    });

    if (error) {
      console.error('❌ Error en la consulta modalidades:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ La tabla modalidades existe pero está vacía o no accesible');
      return {
        data: [],
        mensaje: 'La tabla modalidades está vacía o no accesible'
      };
    }

    console.log('✅ Modalidades cargadas exitosamente:', data.length, 'modalidades');
    console.log('✅ Datos de modalidades:', data);
    return {
      data: data || [],
      mensaje: 'Modalidades obtenidas exitosamente'
    };
  } catch (error: any) {
    console.error('💥 Error obteniendo modalidades:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo modalidades'
    };
  }
};

export const obtenerTamanosEmpresa = async (): Promise<RespuestaAPILibreto<TamanoEmpresa[]>> => {
  try {
    console.log('🔍 Iniciando consulta a tamano_empresa...');
    
    const { data, error } = await supabase
      .from('tamano_empresa')
      .select('*')
      .order('nombre');

    console.log('📊 Resultado de la consulta tamano_empresa:', {
      data: data,
      error: error,
      dataLength: data?.length || 0,
      dataType: typeof data,
      isArray: Array.isArray(data),
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details
    });

    if (error) {
      console.error('❌ Error en la consulta tamano_empresa:', error);
      console.error('❌ Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ La tabla tamano_empresa existe pero está vacía o no accesible');
      console.warn('⚠️ Posibles causas:', {
        rls_habilitado: 'RLS puede estar bloqueando el acceso',
        permisos_usuario: 'El usuario actual no tiene permisos',
        tabla_vacia: 'La tabla realmente está vacía',
        filtros_activos: 'Hay filtros que ocultan los datos'
      });
      return {
        data: [],
        mensaje: 'La tabla tamano_empresa está vacía o no accesible'
      };
    }

    console.log('✅ Tamaños de empresa cargados exitosamente:', data.length, 'tamaños');
    console.log('✅ Datos de tamaños de empresa:', data);
    return {
      data: data || [],
      mensaje: 'Tamaños de empresa obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('💥 Error obteniendo tamaños de empresa:', error);
    console.error('💥 Stack trace:', error.stack);
    return {
      data: [],
      error: error.message || 'Error obteniendo tamaños de empresa'
    };
  }
};

// ====================================
// FUNCIONES PRINCIPALES - LIBRETOS
// ====================================

export const obtenerLibretoPorInvestigacion = async (investigacionId: string): Promise<RespuestaAPILibreto<LibretoInvestigacion | null>> => {
  try {
    if (!investigacionId || typeof investigacionId !== 'string' || investigacionId.length !== 36) {
      console.warn('ID de investigación inválido para buscar libreto:', investigacionId);
      return {
        data: null,
        mensaje: 'ID de investigación inválido para buscar libreto'
      };
    }
    console.log('🔍 Buscando libreto para investigación:', investigacionId);
    
    const { data, error } = await supabase
      .from('libretos_investigacion')
      .select('*')
      .eq('investigacion_id', investigacionId);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      if (data.length > 1) {
        console.warn('⚠️ Hay más de un libreto para la investigación', investigacionId, 'usando el primero.');
      }
      return {
        data: data[0],
        mensaje: 'Libreto obtenido exitosamente'
      };
    } else {
      console.log('ℹ️ No se encontró libreto para la investigación');
      return {
        data: null,
        mensaje: 'No existe libreto para esta investigación'
      };
    }
  } catch (error: any) {
    console.error('Error obteniendo libreto:', error);
    return {
      data: null,
      error: error.message || 'Error obteniendo libreto'
    };
  }
};

export const crearLibreto = async (datos: LibretoFormData): Promise<RespuestaAPILibreto<LibretoInvestigacion>> => {
  try {
    console.log('🔍 === INICIO CREAR LIBRETO ===');
    console.log('🔍 Datos recibidos para crear libreto:', datos);
    console.log('🔍 investigacion_id:', datos.investigacion_id);
    
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Usuario actual:', user?.id);
    
    // Preparar datos para insertar
    const datosParaInsertar = {
      investigacion_id: datos.investigacion_id,
      problema_situacion: datos.problema_situacion || null,
      hipotesis: datos.hipotesis || null,
      objetivos: datos.objetivos || null,
      resultado_esperado: datos.resultado_esperado || null,
      productos_recomendaciones: datos.productos_recomendaciones || null,
      plataforma_id: datos.plataforma_id || null,
      tipo_prueba_id: datos.tipo_prueba_id || null,
      rol_empresa_id: datos.rol_empresa_id || null,
      industria_id: datos.industria_id || null,
      pais_id: datos.pais_id || null,
      modalidad_id: datos.modalidad_id && datos.modalidad_id.length > 0 ? datos.modalidad_id : null,
      tamano_empresa_id: datos.tamano_empresa_id && datos.tamano_empresa_id.length > 0 ? datos.tamano_empresa_id : null,
      numero_participantes: datos.numero_participantes || null,
      nombre_sesion: datos.nombre_sesion || null,
      usuarios_participantes: datos.usuarios_participantes || null,
      duracion_estimada: datos.duracion_estimada || null,
      descripcion_general: datos.descripcion_general || null,
      link_prototipo: datos.link_prototipo || null,
      creado_por: user?.id || null
    };

    console.log('📝 Datos preparados para insertar:', datosParaInsertar);

    // Crear el libreto
    const { data, error } = await supabase
      .from('libretos_investigacion')
      .insert(datosParaInsertar)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando libreto:', error);
      throw error;
    }

    console.log('✅ Libreto creado exitosamente:', data);

    // ACTUALIZAR LA INVESTIGACIÓN CON EL ID DEL LIBRETO Y CAMBIAR ESTADO A 'por_agendar'
    console.log('🔄 Actualizando investigación con el ID del libreto y estado por_agendar...');
    const { error: errorUpdate } = await supabase
      .from('investigaciones')
      .update({ 
        libreto: data.id,
        estado: 'por_agendar' // Cambiar estado automáticamente
      })
      .eq('id', datos.investigacion_id);

    if (errorUpdate) {
      console.error('❌ Error actualizando investigación con libreto y estado:', errorUpdate);
      // No lanzar error aquí, solo logear, porque el libreto ya se creó
      console.warn('⚠️ Libreto creado pero no se pudo actualizar la investigación');
    } else {
      console.log('✅ Investigación actualizada con el ID del libreto y estado por_agendar:', data.id);
    }

    // Si se crearon usuarios_participantes, sincronizar con las sesiones existentes
    if (datos.usuarios_participantes && datos.usuarios_participantes.length > 0) {
      try {
        console.log('🔄 Sincronizando usuarios del libreto con las sesiones existentes...');
        
        // Obtener todas las sesiones de reclutamiento para esta investigación
        const { data: sesiones, error: sesionesError } = await supabase
          .from('reclutamientos')
          .select('id')
          .eq('investigacion_id', datos.investigacion_id);

        if (sesionesError) {
          console.warn('⚠️ Error obteniendo sesiones para sincronizar:', sesionesError);
        } else if (sesiones && sesiones.length > 0) {
          // Actualizar cada sesión con los usuarios del libreto
          const { error: updateError } = await supabase
            .from('reclutamientos')
            .update({ 
              usuarios_libreto: datos.usuarios_participantes,
              actualizado_el: new Date().toISOString()
            })
            .eq('investigacion_id', datos.investigacion_id);

          if (updateError) {
            console.warn('⚠️ Error actualizando sesiones con usuarios del libreto:', updateError);
          } else {
            console.log(`✅ ${sesiones.length} sesiones sincronizadas exitosamente`);
          }
        } else {
          console.log('ℹ️ No hay sesiones existentes para sincronizar');
        }
      } catch (syncError) {
        console.warn('⚠️ Error en sincronización de sesiones:', syncError);
        // No lanzar error aquí, solo logear, porque el libreto ya se creó
      }
    }

    return {
      data: data,
      mensaje: 'Libreto creado, vinculado y investigación marcada como por agendar'
    };
  } catch (error: any) {
    console.error('❌ Error en crearLibreto:', error);
    return {
      data: null,
      error: error.message || 'Error al crear el libreto'
    };
  }
};

export const actualizarLibreto = async (id: string, datos: Partial<LibretoFormData>): Promise<RespuestaAPILibreto<LibretoInvestigacion>> => {
  try {
    console.log('🔍 Actualizando libreto:', id, datos);
    
    // Preparar datos para actualizar (solo los campos que se envían)
    const datosParaActualizar: any = {
      actualizado_el: new Date().toISOString()
    };

    // Solo agregar campos que están definidos y no son cadenas vacías para UUIDs
    if (datos.problema_situacion !== undefined) datosParaActualizar.problema_situacion = datos.problema_situacion;
    if (datos.hipotesis !== undefined) datosParaActualizar.hipotesis = datos.hipotesis;
    if (datos.objetivos !== undefined) datosParaActualizar.objetivos = datos.objetivos;
    if (datos.resultado_esperado !== undefined) datosParaActualizar.resultado_esperado = datos.resultado_esperado;
    if (datos.productos_recomendaciones !== undefined) datosParaActualizar.productos_recomendaciones = datos.productos_recomendaciones;
    
    // Manejar campos UUID - solo incluir si no están vacíos
    if (datos.plataforma_id !== undefined && datos.plataforma_id && datos.plataforma_id.trim() !== '') {
      datosParaActualizar.plataforma_id = datos.plataforma_id;
    } else if (datos.plataforma_id !== undefined) {
      datosParaActualizar.plataforma_id = null;
    }
    
    if (datos.tipo_prueba_id !== undefined && datos.tipo_prueba_id && datos.tipo_prueba_id.trim() !== '') {
      datosParaActualizar.tipo_prueba_id = datos.tipo_prueba_id;
    } else if (datos.tipo_prueba_id !== undefined) {
      datosParaActualizar.tipo_prueba_id = null;
    }
    
    if (datos.rol_empresa_id !== undefined && datos.rol_empresa_id && datos.rol_empresa_id.trim() !== '') {
      datosParaActualizar.rol_empresa_id = datos.rol_empresa_id;
    } else if (datos.rol_empresa_id !== undefined) {
      datosParaActualizar.rol_empresa_id = null;
    }
    
    if (datos.industria_id !== undefined && datos.industria_id && datos.industria_id.trim() !== '') {
      datosParaActualizar.industria_id = datos.industria_id;
    } else if (datos.industria_id !== undefined) {
      datosParaActualizar.industria_id = null;
    }
    
    if (datos.pais_id !== undefined && datos.pais_id && datos.pais_id.trim() !== '') {
      datosParaActualizar.pais_id = datos.pais_id;
    } else if (datos.pais_id !== undefined) {
      datosParaActualizar.pais_id = null;
    }
    
    if (datos.modalidad_id !== undefined && datos.modalidad_id && datos.modalidad_id.length > 0) {
      datosParaActualizar.modalidad_id = datos.modalidad_id;
    } else if (datos.modalidad_id !== undefined) {
      datosParaActualizar.modalidad_id = null;
    }
    
    if (datos.tamano_empresa_id !== undefined && datos.tamano_empresa_id && datos.tamano_empresa_id.length > 0) {
      datosParaActualizar.tamano_empresa_id = datos.tamano_empresa_id;
    } else if (datos.tamano_empresa_id !== undefined) {
      datosParaActualizar.tamano_empresa_id = null;
    }
    
    // Campos no-UUID
    if (datos.numero_participantes !== undefined) datosParaActualizar.numero_participantes = datos.numero_participantes;
    if (datos.nombre_sesion !== undefined) datosParaActualizar.nombre_sesion = datos.nombre_sesion;
    if (datos.usuarios_participantes !== undefined) datosParaActualizar.usuarios_participantes = datos.usuarios_participantes;
    if (datos.duracion_estimada !== undefined) datosParaActualizar.duracion_estimada = datos.duracion_estimada;
    if (datos.descripcion_general !== undefined) datosParaActualizar.descripcion_general = datos.descripcion_general;
    if (datos.link_prototipo !== undefined) datosParaActualizar.link_prototipo = datos.link_prototipo;

    console.log('📝 Datos preparados para actualizar:', datosParaActualizar);

    const { data, error } = await supabase
      .from('libretos_investigacion')
      .update(datosParaActualizar)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Libreto actualizado exitosamente:', data);

    // Si se actualizaron los usuarios_participantes, sincronizar con las sesiones
    if (datos.usuarios_participantes !== undefined) {
      try {
        console.log('🔄 Sincronizando usuarios del libreto con las sesiones...');
        
        // Obtener todas las sesiones de reclutamiento para esta investigación
        const { data: sesiones, error: sesionesError } = await supabase
          .from('reclutamientos')
          .select('id')
          .eq('investigacion_id', data.investigacion_id);

        if (sesionesError) {
          console.warn('⚠️ Error obteniendo sesiones para sincronizar:', sesionesError);
        } else if (sesiones && sesiones.length > 0) {
          // Actualizar cada sesión con los usuarios del libreto
          const { error: updateError } = await supabase
            .from('reclutamientos')
            .update({ 
              usuarios_libreto: datos.usuarios_participantes || null,
              actualizado_el: new Date().toISOString()
            })
            .eq('investigacion_id', data.investigacion_id);

          if (updateError) {
            console.warn('⚠️ Error actualizando sesiones con usuarios del libreto:', updateError);
          } else {
            console.log(`✅ ${sesiones.length} sesiones sincronizadas exitosamente`);
          }
        } else {
          console.log('ℹ️ No hay sesiones para sincronizar');
        }
      } catch (syncError) {
        console.warn('⚠️ Error en sincronización de sesiones:', syncError);
        // No lanzar error aquí, solo logear, porque el libreto ya se actualizó
      }
    }

    return {
      data: data,
      mensaje: 'Libreto actualizado exitosamente'
    };
  } catch (error: any) {
    console.error('Error actualizando libreto:', error);
    return {
      data: {} as LibretoInvestigacion,
      error: error.message || 'Error actualizando libreto'
    };
  }
};

export const eliminarLibreto = async (id: string): Promise<RespuestaAPILibreto<boolean>> => {
  try {
    console.log('🗑️ Eliminando libreto:', id);
    
    const { error } = await supabase
      .from('libretos_investigacion')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Libreto eliminado exitosamente');
    return {
      data: true,
      mensaje: 'Libreto eliminado exitosamente'
    };
  } catch (error: any) {
    console.error('Error eliminando libreto:', error);
    return {
      data: false,
      error: error.message || 'Error eliminando libreto'
    };
  }
};

// ====================================
// FUNCIONES PARA OBTENER LIBRETOS DISPONIBLES
// ====================================

export const obtenerLibretosDisponibles = async (): Promise<RespuestaAPILibreto<LibretoInvestigacion[]>> => {
  try {
    console.log('🔍 Obteniendo libretos disponibles (sin asignar)...');
    
    // Obtener libretos que no están asignados a ninguna investigación
    const { data, error } = await supabase
      .from('libretos_investigacion')
      .select('*')
      .is('investigacion_id', null)
      .order('creado_el', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo libretos disponibles:', error);
      throw error;
    }

    console.log('✅ Libretos disponibles encontrados:', data?.length || 0);
    return {
      data: data || [],
      mensaje: 'Libretos disponibles obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo libretos disponibles:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo libretos disponibles'
    };
  }
};

export const obtenerTodosLosLibretos = async (): Promise<RespuestaAPILibreto<LibretoInvestigacion[]>> => {
  try {
    console.log('🔍 Obteniendo todos los libretos...');
    
    const { data, error } = await supabase
      .from('libretos_investigacion')
      .select('*')
      .order('creado_el', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo todos los libretos:', error);
      throw error;
    }

    console.log('✅ Total de libretos encontrados:', data?.length || 0);
    return {
      data: data || [],
      mensaje: 'Todos los libretos obtenidos exitosamente'
    };
  } catch (error: any) {
    console.error('Error obteniendo todos los libretos:', error);
    return {
      data: [],
      error: error.message || 'Error obteniendo todos los libretos'
    };
  }
};

// ====================================
// FUNCIONES AUXILIARES
// ====================================

export const validarLibreto = (datos: LibretoFormData): string[] => {
  const errores: string[] = [];

  // Validar campo requerido
  if (!datos.investigacion_id || !datos.investigacion_id.trim()) {
    errores.push('La investigación es requerida');
  }

  // Validar número de participantes si se proporciona
  if (datos.numero_participantes !== undefined && datos.numero_participantes !== null) {
    if (datos.numero_participantes < 1 || datos.numero_participantes > 50) {
      errores.push('El número de participantes debe estar entre 1 y 50');
    }
  }

  // Validar duración estimada si se proporciona
  if (datos.duracion_estimada !== undefined && datos.duracion_estimada !== null) {
    if (datos.duracion_estimada < 5 || datos.duracion_estimada > 480) {
      errores.push('La duración estimada debe estar entre 5 y 480 minutos');
    }
  }

  // Validar URL del prototipo si se proporciona
  if (datos.link_prototipo && datos.link_prototipo.trim()) {
    try {
      new URL(datos.link_prototipo);
    } catch {
      errores.push('El link del prototipo debe ser una URL válida');
    }
  }

  return errores;
}; 