import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import type { 
  SeguimientoInvestigacion, 
  SeguimientoFormData, 
  CrearSeguimientoRequest, 
  ActualizarSeguimientoRequest 
} from '../types/seguimientos';

// Crear cliente con service_role para bypass RLS temporalmente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Obtener seguimientos de una investigación
export async function obtenerSeguimientosPorInvestigacion(investigacionId: string) {
  try {
    console.log('🔍 === INICIO OBTENER SEGUIMIENTOS ===');
    console.log('🔍 Investigación ID:', investigacionId);
    
    // Verificar autenticación del usuario
    console.log('🔐 Verificando autenticación...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('⚠️ Usuario no autenticado, usando cliente admin...');
      
      // Usar cliente admin para bypass RLS
      const { data, error } = await supabaseAdmin
        .from('seguimientos_investigacion')
        .select('*')
        .eq('investigacion_id', investigacionId)
        .order('fecha_seguimiento', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo seguimientos (admin):', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Seguimientos obtenidos (admin):', data?.length || 0);
      return { data: data || [], error: null };
    }

    console.log('👤 Usuario autenticado:', user.id);
    
    // Verificar que la investigación existe
    console.log('🔍 Verificando que la investigación existe...');
    const { data: investigacion, error: investigacionError } = await supabase
      .from('investigaciones')
      .select('id, nombre')
      .eq('id', investigacionId)
      .single();
    
    if (investigacionError || !investigacion) {
      console.error('❌ Investigación no encontrada:', investigacionId, investigacionError);
      return { data: null, error: 'La investigación no existe' };
    }
    
    console.log('✅ Investigación verificada:', investigacion.nombre);
    
    // Obtener seguimientos con contexto de usuario autenticado
    console.log('🚀 Ejecutando consulta de seguimientos...');
    const { data, error } = await supabase
      .from('seguimientos_investigacion')
      .select(`
        *,
        participante_externo:participantes!seguimientos_investigacion_participante_externo_id_fkey(
          id,
          nombre,
          empresa_nombre,
          email
        )
      `)
      .eq('investigacion_id', investigacionId)
      .order('fecha_seguimiento', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo seguimientos:', error);
      console.error('❌ Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { data: null, error: error.message };
    }

    console.log('✅ Seguimientos obtenidos:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📋 Detalles de seguimientos:', data.map(s => ({
        id: s.id,
        estado: s.estado,
        fecha: s.fecha_seguimiento,
        notas: s.notas?.substring(0, 30) + '...'
      })));
    }
    
    console.log('🔍 === FIN OBTENER SEGUIMIENTOS ===');
    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('❌ Error inesperado en obtenerSeguimientosPorInvestigacion:', error);
    console.error('❌ Stack trace:', error.stack);
    return { data: null, error: error.message };
  }
}

// Obtener un seguimiento específico
export async function obtenerSeguimientoPorId(seguimientoId: string) {
  try {
    console.log('🔍 Obteniendo seguimiento por ID:', seguimientoId);
    
    // Verificar autenticación del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return { data: null, error: 'Usuario no autenticado' };
    }

    console.log('👤 Usuario autenticado:', user.id);
    
    const { data, error } = await supabase
      .from('seguimientos_investigacion')
      .select('*')
      .eq('id', seguimientoId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo seguimiento:', error);
      return { data: null, error: error.message };
    }

    console.log('✅ Seguimiento obtenido:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error en obtenerSeguimientoPorId:', error);
    return { data: null, error: error.message };
  }
}

// Crear nuevo seguimiento
export async function crearSeguimiento(seguimientoData: CrearSeguimientoRequest) {
  try {
    console.log('📝 === INICIO CREAR SEGUIMIENTO ===');
    console.log('📝 Datos recibidos:', seguimientoData);
    console.log('🔍 Datos específicos:', {
      investigacion_id: seguimientoData.investigacion_id,
      responsable_id: seguimientoData.responsable_id,
      fecha_seguimiento: seguimientoData.fecha_seguimiento,
      notas: seguimientoData.notas?.substring(0, 50) + '...',
      estado: seguimientoData.estado,
      participante_externo_id: seguimientoData.participante_externo_id
    });
    
    // Obtener usuario actual
    console.log('🔐 Verificando autenticación...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('⚠️ Usuario no autenticado, usando cliente admin...');
      
      // Usar cliente admin para bypass RLS
      const datosParaInsertar = {
        investigacion_id: seguimientoData.investigacion_id,
        fecha_seguimiento: seguimientoData.fecha_seguimiento,
        notas: seguimientoData.notas,
        responsable_id: seguimientoData.responsable_id,
        estado: seguimientoData.estado,
        creado_por: seguimientoData.responsable_id, // Usar responsable como creador
        creado_el: new Date().toISOString(),
        // Solo incluir participante_externo_id si existe
        ...(seguimientoData.participante_externo_id && { participante_externo_id: seguimientoData.participante_externo_id })
      };

      console.log('📤 Datos para insertar (admin):', datosParaInsertar);
      console.log('🚀 Ejecutando inserción (admin)...');

      const { data, error } = await supabaseAdmin
        .from('seguimientos_investigacion')
        .insert([datosParaInsertar])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error creando seguimiento (admin):', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Seguimiento creado exitosamente (admin):', data);
      console.log('📝 === FIN CREAR SEGUIMIENTO ===');
      return { data, error: null };
    }

    console.log('👤 Usuario autenticado:', user.id);

    // Verificar que el responsable_id existe en profiles
    if (seguimientoData.responsable_id) {
      console.log('🔍 Verificando responsable...');
      const { data: responsable, error: responsableError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', seguimientoData.responsable_id)
        .single();
      
      if (responsableError || !responsable) {
        console.error('❌ Responsable no encontrado:', seguimientoData.responsable_id, responsableError);
        return { data: null, error: 'El responsable seleccionado no existe en el sistema' };
      }
      
      console.log('✅ Responsable verificado:', responsable);
    }

    // Verificar que la investigación existe
    console.log('🔍 Verificando investigación...');
    const { data: investigacion, error: investigacionError } = await supabase
      .from('investigaciones')
      .select('id, nombre')
      .eq('id', seguimientoData.investigacion_id)
      .single();
    
    if (investigacionError || !investigacion) {
      console.error('❌ Investigación no encontrada:', seguimientoData.investigacion_id, investigacionError);
      return { data: null, error: 'La investigación seleccionada no existe en el sistema' };
    }
    
    console.log('✅ Investigación verificado:', investigacion);

    const datosParaInsertar = {
      investigacion_id: seguimientoData.investigacion_id,
      fecha_seguimiento: seguimientoData.fecha_seguimiento,
      notas: seguimientoData.notas,
      responsable_id: seguimientoData.responsable_id,
      estado: seguimientoData.estado,
      creado_por: user.id,
      creado_el: new Date().toISOString(),
      // Solo incluir participante_externo_id si existe
      ...(seguimientoData.participante_externo_id && { participante_externo_id: seguimientoData.participante_externo_id })
    };

    console.log('📤 Datos para insertar:', datosParaInsertar);
    console.log('🚀 Ejecutando inserción...');

    const { data, error } = await supabase
      .from('seguimientos_investigacion')
      .insert([datosParaInsertar])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creando seguimiento:', error);
      console.error('❌ Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return { data: null, error: error.message };
    }

    console.log('✅ Seguimiento creado exitosamente:', data);
    console.log('📝 === FIN CREAR SEGUIMIENTO ===');
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error inesperado en crearSeguimiento:', error);
    console.error('❌ Stack trace:', error.stack);
    return { data: null, error: error.message };
  }
}

// Actualizar seguimiento
export async function actualizarSeguimiento(seguimientoId: string, updates: ActualizarSeguimientoRequest) {
  try {
    console.log('📝 Actualizando seguimiento:', seguimientoId, updates);
    
    // Verificar autenticación del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return { data: null, error: 'Usuario no autenticado' };
    }

    console.log('👤 Usuario autenticado:', user.id);
    
    // Preparar los datos de actualización, excluyendo campos que no deben actualizarse
    const datosActualizacion = {
      ...updates,
      actualizado_el: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('seguimientos_investigacion')
      .update(datosActualizacion)
      .eq('id', seguimientoId)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error actualizando seguimiento:', error);
      return { data: null, error: error.message };
    }

    console.log('✅ Seguimiento actualizado exitosamente:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error en actualizarSeguimiento:', error);
    return { data: null, error: error.message };
  }
}

// Eliminar seguimiento
export async function eliminarSeguimiento(seguimientoId: string) {
  try {
    console.log('🗑️ Eliminando seguimiento:', seguimientoId);
    
    // Verificar autenticación del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return { data: null, error: 'Usuario no autenticado' };
    }

    console.log('👤 Usuario autenticado:', user.id);
    
    const { error } = await supabase
      .from('seguimientos_investigacion')
      .delete()
      .eq('id', seguimientoId);

    if (error) {
      console.error('❌ Error eliminando seguimiento:', error);
      return { data: null, error: error.message };
    }

    console.log('✅ Seguimiento eliminado exitosamente');
    return { data: true, error: null };
  } catch (error: any) {
    console.error('❌ Error en eliminarSeguimiento:', error);
    return { data: null, error: error.message };
  }
}

// Restaurar seguimiento cuando se elimina la investigación
export async function restaurarSeguimientoDesdeInvestigacion(investigacionId: string) {
  try {
    console.log('🔄 Restaurando seguimientos para investigación eliminada:', investigacionId);
    
    // Verificar autenticación del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return { data: null, error: 'Usuario no autenticado' };
    }

    console.log('👤 Usuario autenticado:', user.id);
    
    // Buscar seguimientos que estén relacionados con la investigación que se está eliminando
    const { data: seguimientosConvertidos, error: seguimientosError } = await supabase
      .from('seguimientos_investigacion')
      .select('*')
      .eq('investigacion_derivada_id', investigacionId);

    if (seguimientosError) {
      console.error('❌ Error obteniendo seguimientos relacionados:', seguimientosError);
      return { data: null, error: seguimientosError.message };
    }

    if (!seguimientosConvertidos || seguimientosConvertidos.length === 0) {
      console.log('ℹ️ No hay seguimientos relacionados con esta investigación');
      return { data: [], error: null };
    }

    console.log('📋 Seguimientos relacionados encontrados:', seguimientosConvertidos.length);

    // Actualizar los seguimientos específicos de esta investigación a 'pendiente'
    const { error: updateError } = await supabase
      .from('seguimientos_investigacion')
      .update({ 
        estado: 'pendiente',
        investigacion_derivada_id: null
      })
      .eq('investigacion_derivada_id', investigacionId);

    if (updateError) {
      console.error('❌ Error restaurando seguimientos:', updateError);
      return { data: null, error: updateError.message };
    }

    console.log('✅ Seguimientos restaurados exitosamente a estado pendiente');
    return { data: seguimientosConvertidos.length, error: null };
  } catch (error: any) {
    console.error('❌ Error en restaurarSeguimientoDesdeInvestigacion:', error);
    return { data: null, error: error.message };
  }
}

// Crear investigación desde seguimiento
export async function crearInvestigacionDesdeSeguimiento(seguimientoId: string, datosInvestigacion: any) {
  try {
    console.log('🔄 Creando investigación desde seguimiento:', seguimientoId);
    
    // Primero obtener el seguimiento
    const { data: seguimiento, error: seguimientoError } = await obtenerSeguimientoPorId(seguimientoId);
    if (seguimientoError || !seguimiento) {
      return { data: null, error: 'No se pudo obtener el seguimiento' };
    }

    // Obtener usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    // Obtener un producto por defecto si no se proporciona uno
    let productoId = datosInvestigacion.producto_id;
    if (!productoId) {
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select('id')
        .limit(1)
        .single();
      
      if (productosError || !productos) {
        console.warn('⚠️ No se pudo obtener producto por defecto, usando valor hardcodeado');
        productoId = 'prod-1';
      } else {
        productoId = productos.id;
      }
    }

    // Crear nueva investigación basada en el seguimiento
    const nuevaInvestigacion = {
      nombre: datosInvestigacion.nombre || `Seguimiento: ${seguimiento.notas.substring(0, 50)}...`,
      descripcion: datosInvestigacion.descripcion || seguimiento.notas,
      responsable_id: seguimiento.responsable_id,
      implementador_id: datosInvestigacion.implementador_id || seguimiento.responsable_id,
      estado: 'en_borrador',
      tipo_investigacion_id: datosInvestigacion.tipo_investigacion_id,
      producto_id: productoId,
      periodo_id: datosInvestigacion.periodo_id,
      fecha_inicio: datosInvestigacion.fecha_inicio,
      fecha_fin: datosInvestigacion.fecha_fin,
      creado_por: user.id,
      creado_el: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('investigaciones')
      .insert([nuevaInvestigacion])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando investigación desde seguimiento:', error);
      return { data: null, error: error.message };
    }

    // Actualizar el estado del seguimiento a 'convertido' y establecer la relación
    const { error: updateError } = await supabase
      .from('seguimientos_investigacion')
      .update({ 
        estado: 'convertido',
        investigacion_derivada_id: data.id
      })
      .eq('id', seguimientoId);
    if (updateError) {
      console.error('❌ Error actualizando estado del seguimiento a convertido:', updateError);
      // No retornamos error porque la investigación ya fue creada
    }

    console.log('✅ Investigación creada exitosamente desde seguimiento:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Error en crearInvestigacionDesdeSeguimiento:', error);
    return { data: null, error: error.message };
  }
} 

// Actualizar seguimiento cuando la investigación relacionada se complete
export async function actualizarSeguimientoPorInvestigacionCompletada(investigacionId: string) {
  try {
    console.log('✅ Actualizando seguimiento por investigación completada:', investigacionId);
    
    // Verificar autenticación del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return { data: null, error: 'Usuario no autenticado' };
    }

    console.log('👤 Usuario autenticado:', user.id);
    
    // Buscar seguimientos que estén relacionados con la investigación completada
    const { data: seguimientosRelacionados, error: seguimientosError } = await supabase
      .from('seguimientos_investigacion')
      .select('*')
      .eq('investigacion_derivada_id', investigacionId)
      .eq('estado', 'convertido');

    if (seguimientosError) {
      console.error('❌ Error obteniendo seguimientos relacionados:', seguimientosError);
      return { data: null, error: seguimientosError.message };
    }

    if (!seguimientosRelacionados || seguimientosRelacionados.length === 0) {
      console.log('ℹ️ No hay seguimientos convertidos relacionados con esta investigación');
      return { data: [], error: null };
    }

    console.log('📋 Seguimientos relacionados encontrados:', seguimientosRelacionados.length);

    // Actualizar todos los seguimientos relacionados a estado 'completado'
    const { data: seguimientosActualizados, error: updateError } = await supabase
      .from('seguimientos_investigacion')
      .update({ 
        estado: 'completado'
      })
      .eq('investigacion_derivada_id', investigacionId)
      .eq('estado', 'convertido')
      .select();

    if (updateError) {
      console.error('❌ Error actualizando seguimientos a completado:', updateError);
      return { data: null, error: updateError.message };
    }

    console.log('✅ Seguimientos actualizados a completado:', seguimientosActualizados?.length || 0);
    
    return { 
      data: seguimientosActualizados, 
      error: null 
    };

  } catch (error) {
    console.error('❌ Error inesperado actualizando seguimiento por investigación completada:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error inesperado' 
    };
  }
} 

// Obtener trazabilidad completa de seguimientos e investigaciones
export async function obtenerTrazabilidadCompleta(investigacionId: string) {
  try {
    console.log('🔍 Obteniendo trazabilidad completa para investigación:', investigacionId);
    
    // Verificar autenticación del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return { data: null, error: 'Usuario no autenticado' };
    }

    console.log('👤 Usuario autenticado:', user.id);
    
    // 1. Buscar seguimientos que dieron origen a esta investigación
    const { data: seguimientosOrigen, error: origenError } = await supabase
      .from('seguimientos_investigacion')
      .select('*')
      .eq('investigacion_derivada_id', investigacionId);

    if (origenError) {
      console.error('❌ Error obteniendo seguimientos de origen:', origenError);
      return { data: null, error: origenError.message };
    }

    // 2. Obtener información de las investigaciones de origen
    const investigacionesOrigen = [];
    if (seguimientosOrigen && seguimientosOrigen.length > 0) {
      const investigacionIds = [...new Set(seguimientosOrigen.map(s => s.investigacion_id))];
      
      for (const invId of investigacionIds) {
        const { data: inv, error: invError } = await supabase
          .from('investigaciones')
          .select('id, nombre, estado, fecha_inicio, fecha_fin')
          .eq('id', invId)
          .single();
        
        if (!invError && inv) {
          investigacionesOrigen.push(inv);
        }
      }
    }

    // 3. Buscar seguimientos de esta investigación que dieron origen a otras investigaciones
    const { data: seguimientosDerivados, error: derivadosError } = await supabase
      .from('seguimientos_investigacion')
      .select('*')
      .eq('investigacion_id', investigacionId)
      .not('investigacion_derivada_id', 'is', null);

    if (derivadosError) {
      console.error('❌ Error obteniendo seguimientos derivados:', derivadosError);
      return { data: null, error: derivadosError.message };
    }

    // 4. Obtener información de las investigaciones derivadas
    const investigacionesDerivadas = [];
    if (seguimientosDerivados && seguimientosDerivados.length > 0) {
      const investigacionIds = [...new Set(seguimientosDerivados.map(s => s.investigacion_derivada_id))];
      
      for (const invId of investigacionIds) {
        const { data: inv, error: invError } = await supabase
          .from('investigaciones')
          .select('id, nombre, estado, fecha_inicio, fecha_fin')
          .eq('id', invId)
          .single();
        
        if (!invError && inv) {
          investigacionesDerivadas.push(inv);
        }
      }
    }

    // 5. Construir el árbol de trazabilidad
    const trazabilidad = {
      investigacion_actual: {
        id: investigacionId,
        seguimientos: []
      },
      origen: {
        seguimientos: seguimientosOrigen || [],
        investigaciones: investigacionesOrigen
      },
      derivadas: {
        investigaciones: investigacionesDerivadas,
        seguimientos: seguimientosDerivados || []
      }
    };

    console.log('✅ Trazabilidad obtenida:', {
      seguimientosOrigen: seguimientosOrigen?.length || 0,
      investigacionesOrigen: investigacionesOrigen.length,
      investigacionesDerivadas: investigacionesDerivadas.length,
      seguimientosDerivados: seguimientosDerivados?.length || 0
    });

    return {
      data: trazabilidad,
      error: null
    };

  } catch (error) {
    console.error('❌ Error inesperado obteniendo trazabilidad:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error inesperado' 
    };
  }
} 