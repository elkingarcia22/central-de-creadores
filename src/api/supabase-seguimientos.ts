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
    
    // Usar la nueva API de seguimientos
    const response = await fetch(`/api/seguimientos?investigacion_id=${investigacionId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error en API de seguimientos:', errorData);
      return { data: null, error: errorData.error || 'Error obteniendo seguimientos' };
    }
    
    const result = await response.json();
    console.log('✅ Seguimientos obtenidos desde API:', result.data?.length || 0);
    
    if (result.data && result.data.length > 0) {
      console.log('📋 Detalles de seguimientos:', result.data.map((s: any) => ({
        id: s.id,
        estado: s.estado,
        fecha: s.fecha_seguimiento,
        notas: s.notas?.substring(0, 30) + '...'
      })));
    }
    
    console.log('🔍 === FIN OBTENER SEGUIMIENTOS ===');
    return { data: result.data || [], error: null };
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
    
    // Usar la nueva API de seguimientos
    const response = await fetch('/api/seguimientos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seguimientoData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error en API de seguimientos:', errorData);
      return { data: null, error: errorData.error || 'Error creando seguimiento' };
    }
    
    const result = await response.json();
    console.log('✅ Seguimiento creado exitosamente desde API:', result.data);
    console.log('📝 === FIN CREAR SEGUIMIENTO ===');
    return { data: result.data, error: null };
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
    console.log('📝 URL de la API:', `/api/seguimientos/${seguimientoId}`);
    
    // Usar la nueva API de seguimientos
    const response = await fetch(`/api/seguimientos/${seguimientoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    console.log('📝 Response status:', response.status);
    console.log('📝 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Intentar obtener el texto de la respuesta para debuggear
      const responseText = await response.text();
      console.error('❌ Error response text:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.error('❌ Error en API de seguimientos (JSON):', errorData);
        return { data: null, error: errorData.error || 'Error actualizando seguimiento' };
      } catch (parseError) {
        console.error('❌ Error parseando respuesta como JSON:', parseError);
        return { data: null, error: `Error del servidor (${response.status}): ${responseText.substring(0, 200)}` };
      }
    }

    const result = await response.json();
    console.log('✅ Seguimiento actualizado exitosamente:', result.data);
    return { data: result.data, error: null };
  } catch (error: any) {
    console.error('❌ Error en actualizarSeguimiento:', error);
    return { data: null, error: error.message };
  }
}

// Eliminar seguimiento
export async function eliminarSeguimiento(seguimientoId: string) {
  try {
    console.log('🗑️ Eliminando seguimiento:', seguimientoId);
    
    // Usar la nueva API de seguimientos
    const response = await fetch(`/api/seguimientos/${seguimientoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error en API de seguimientos:', errorData);
      return { data: null, error: errorData.error || 'Error eliminando seguimiento' };
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
    console.log('🔍 Datos recibidos:', datosInvestigacion);
    
    // Validar que los IDs sean UUIDs válidos
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (datosInvestigacion.tipo_investigacion_id && !uuidRegex.test(datosInvestigacion.tipo_investigacion_id)) {
      console.error('❌ tipo_investigacion_id no es un UUID válido:', datosInvestigacion.tipo_investigacion_id);
      return { data: null, error: 'ID de tipo de investigación no válido' };
    }
    
    if (datosInvestigacion.producto_id && !uuidRegex.test(datosInvestigacion.producto_id)) {
      console.error('❌ producto_id no es un UUID válido:', datosInvestigacion.producto_id);
      return { data: null, error: 'ID de producto no válido' };
    }
    
    if (datosInvestigacion.periodo_id && !uuidRegex.test(datosInvestigacion.periodo_id)) {
      console.error('❌ periodo_id no es un UUID válido:', datosInvestigacion.periodo_id);
      return { data: null, error: 'ID de período no válido' };
    }
    
    if (datosInvestigacion.responsable_id && !uuidRegex.test(datosInvestigacion.responsable_id)) {
      console.error('❌ responsable_id no es un UUID válido:', datosInvestigacion.responsable_id);
      return { data: null, error: 'ID de responsable no válido' };
    }
    
    if (datosInvestigacion.implementador_id && !uuidRegex.test(datosInvestigacion.implementador_id)) {
      console.error('❌ implementador_id no es un UUID válido:', datosInvestigacion.implementador_id);
      return { data: null, error: 'ID de implementador no válido' };
    }
    
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