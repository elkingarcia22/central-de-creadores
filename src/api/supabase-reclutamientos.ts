import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipos para reclutamientos
export interface Reclutamiento {
  id: string;
  investigacion_id: string;
  participantes_id: string;
  fecha_asignado: string;
  fecha_sesion?: string;
  reclutador_id: string;
  creado_por: string;
  estado_agendamiento: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReclutamientoCompleto {
  id: string;
  investigacion_id: string;
  participantes_id: string;
  fecha_asignado: string;
  fecha_sesion?: string;
  reclutador_id: string;
  creado_por: string;
  estado_agendamiento: string;
  
  // Datos de la investigación
  investigacion_nombre: string;
  investigacion_descripcion: string;
  investigacion_estado: string;
  investigacion_fecha_inicio: string;
  investigacion_fecha_fin: string;
  
  // Datos del participante
  participante_nombre: string;
  participante_apellido: string;
  participante_email: string;
  participante_telefono?: string;
  participante_edad?: number;
  participante_genero?: string;
  
  // Datos del reclutador
  reclutador_nombre: string;
  reclutador_apellido: string;
  reclutador_email: string;
  
  // Datos del creador
  creador_nombre: string;
  creador_apellido: string;
  creador_email: string;
  
  // Datos del estado de agendamiento
  estado_agendamiento_nombre: string;
  estado_agendamiento_descripcion: string;
  estado_agendamiento_color: string;
  
  // Verificar si la investigación tiene libreto
  tiene_libreto: boolean;
  
  // Fechas formateadas
  fecha_asignado_date: string;
  fecha_sesion_date?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface ReclutamientoFormData {
  investigacion_id: string;
  participantes_id: string;
  fecha_sesion?: string;
  estado_agendamiento: string;
}

// Obtener todos los reclutamientos desde la base de datos real
export const obtenerReclutamientos = async () => {
  try {
    console.log('🔍 Obteniendo reclutamientos desde la base de datos...');
    
    // Intentar obtener desde la vista si existe
    let { data, error } = await supabase
      .from('vista_reclutamientos_completa')
      .select('*')
      .order('fecha_asignado', { ascending: false });

    if (error) {
      console.log('⚠️ Vista no existe, intentando consulta directa:', error.message);
      
      // Si la vista no existe, hacer consulta directa a la tabla reclutamientos
      const { data: reclutamientos, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select(`
          id,
          investigacion_id,
          participantes_id,
          fecha_asignado,
          fecha_sesion,
          reclutador_id,
          creado_por,
          estado_agendamiento
        `)
        .order('fecha_asignado', { ascending: false });

      if (errorReclutamientos) {
        console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
        return { data: null, error: errorReclutamientos.message };
      }

      // Si no hay datos en la tabla real, devolver array vacío
      if (!reclutamientos || reclutamientos.length === 0) {
        console.log('📊 No hay reclutamientos en la base de datos');
        return { data: [], error: null };
      }

      // Por ahora, devolver datos básicos hasta que se complete la vista
      const reclutamientosFormateados = reclutamientos.map(rec => ({
        id: rec.id,
        investigacion_id: rec.investigacion_id,
        participantes_id: rec.participantes_id,
        fecha_asignado: rec.fecha_asignado,
        fecha_sesion: rec.fecha_sesion,
        reclutador_id: rec.reclutador_id,
        creado_por: rec.creado_por,
        estado_agendamiento: rec.estado_agendamiento,
        // Datos simulados para campos que requieren joins
        investigacion_nombre: 'Investigación ' + rec.investigacion_id.substring(0, 8),
        investigacion_descripcion: 'Descripción de la investigación',
        investigacion_estado: 'por_agendar',
        investigacion_fecha_inicio: '2024-01-01',
        investigacion_fecha_fin: '2024-12-31',
        participante_nombre: 'Participante',
        participante_apellido: rec.participantes_id.substring(0, 8),
        participante_email: 'participante@email.com',
        participante_telefono: '+573001234567',
        participante_edad: 30,
        participante_genero: 'No especificado',
        reclutador_nombre: 'Reclutador',
        reclutador_apellido: rec.reclutador_id.substring(0, 8),
        reclutador_email: 'reclutador@empresa.com',
        creador_nombre: 'Creador',
        creador_apellido: rec.creado_por.substring(0, 8),
        creador_email: 'creador@empresa.com',
        estado_agendamiento_nombre: 'Pendiente',
        estado_agendamiento_descripcion: 'Reclutamiento pendiente',
        estado_agendamiento_color: '#f59e0b',
        tiene_libreto: true,
        fecha_asignado_date: rec.fecha_asignado ? new Date(rec.fecha_asignado).toISOString().split('T')[0] : '',
        fecha_sesion_date: rec.fecha_sesion ? new Date(rec.fecha_sesion).toISOString().split('T')[0] : null,
        created_at: rec.fecha_asignado, // Usar fecha_asignado como created_at
        updated_at: rec.fecha_asignado  // Usar fecha_asignado como updated_at
      }));

      console.log('✅ Reclutamientos obtenidos desde tabla real:', reclutamientosFormateados.length);
      return { data: reclutamientosFormateados, error: null };
    }

    console.log('✅ Reclutamientos obtenidos desde vista:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error inesperado obteniendo reclutamientos:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Obtener reclutamiento por ID
export const obtenerReclutamientoPorId = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('vista_reclutamientos_completa')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo reclutamiento:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error inesperado obteniendo reclutamiento:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Crear nuevo reclutamiento
export const crearReclutamiento = async (reclutamientoData: ReclutamientoFormData) => {
  try {
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const nuevoReclutamiento = {
      ...reclutamientoData,
      reclutador_id: user.id,
      creado_por: user.id,
      fecha_asignado: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reclutamientos')
      .insert([nuevoReclutamiento])
      .select()
      .single();

    if (error) {
      console.error('Error creando reclutamiento:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error inesperado creando reclutamiento:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Actualizar reclutamiento
export const actualizarReclutamiento = async (id: string, reclutamientoData: Partial<ReclutamientoFormData>) => {
  try {
    const { data, error } = await supabase
      .from('reclutamientos')
      .update({
        ...reclutamientoData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando reclutamiento:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error inesperado actualizando reclutamiento:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Eliminar reclutamiento
export const eliminarReclutamiento = async (id: string) => {
  try {
    const { error } = await supabase
      .from('reclutamientos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando reclutamiento:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error inesperado eliminando reclutamiento:', error);
    return { error: 'Error inesperado' };
  }
};

// Obtener investigaciones con libreto para el formulario
export const obtenerInvestigacionesConLibreto = async () => {
  try {
    // Obtener investigaciones que están en reclutamiento (tienen registro en tabla reclutamientos)
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('investigacion_id');

    if (reclutamientosError) {
      console.error('Error obteniendo reclutamientos:', reclutamientosError);
      return { data: null, error: reclutamientosError.message };
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      console.log('📊 No hay investigaciones en reclutamiento');
      return { data: [], error: null };
    }

    // Obtener los IDs únicos de investigaciones en reclutamiento
    const investigacionesIds = [...new Set(reclutamientos.map(r => r.investigacion_id))];

    // Obtener los detalles de esas investigaciones
    const { data: investigaciones, error: investigacionesError } = await supabase
      .from('investigaciones')
      .select(`
        id,
        nombre,
        descripcion,
        estado,
        fecha_inicio,
        fecha_fin
      `)
      .in('id', investigacionesIds)
      .order('nombre');

    if (investigacionesError) {
      console.error('Error obteniendo investigaciones:', investigacionesError);
      return { data: null, error: investigacionesError.message };
    }

    console.log('✅ Investigaciones en reclutamiento:', investigaciones?.length || 0);
    return { data: investigaciones || [], error: null };
  } catch (error) {
    console.error('Error inesperado obteniendo investigaciones con libreto:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Obtener participantes (versión simplificada)
export const obtenerParticipantes = async () => {
  try {
    const datosSimulados = [
      {
        id: 'part-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '+573001234567',
        edad: 28,
        genero: 'Masculino',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null
      },
      {
        id: 'part-2',
        nombre: 'María',
        apellido: 'López',
        email: 'maria.lopez@email.com',
        telefono: '+573007654321',
        edad: 32,
        genero: 'Femenino',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        deleted_at: null
      },
      {
        id: 'part-3',
        nombre: 'Carlos',
        apellido: 'González',
        email: 'carlos.gonzalez@email.com',
        telefono: '+573001112223',
        edad: 25,
        genero: 'Masculino',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
        deleted_at: null
      }
    ];

    return { data: datosSimulados, error: null };
  } catch (error) {
    console.error('Error inesperado obteniendo participantes:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Obtener estados de agendamiento (versión simplificada)
export const obtenerEstadosAgendamiento = async () => {
  try {
    const datosSimulados = [
      {
        id: 'estado-1',
        nombre: 'Pendiente',
        descripcion: 'Reclutamiento pendiente de confirmación',
        color: '#f59e0b',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'estado-2',
        nombre: 'Confirmado',
        descripcion: 'Reclutamiento confirmado',
        color: '#10b981',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'estado-3',
        nombre: 'Completado',
        descripcion: 'Reclutamiento completado',
        color: '#3b82f6',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'estado-4',
        nombre: 'Cancelado',
        descripcion: 'Reclutamiento cancelado',
        color: '#ef4444',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'estado-5',
        nombre: 'No Show',
        descripcion: 'Participante no asistió',
        color: '#6b7280',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'estado-6',
        nombre: 'Reprogramado',
        descripcion: 'Reclutamiento reprogramado',
        color: '#8b5cf6',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    return { data: datosSimulados, error: null };
  } catch (error) {
    console.error('Error inesperado obteniendo estados de agendamiento:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Obtener reclutamientos por investigación
export const obtenerReclutamientosPorInvestigacion = async (investigacionId: string) => {
  try {
    const { data, error } = await supabase
      .from('vista_reclutamientos_completa')
      .select('*')
      .eq('investigacion_id', investigacionId)
      .order('fecha_asignado', { ascending: false });

    if (error) {
      console.error('Error obteniendo reclutamientos por investigación:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error inesperado obteniendo reclutamientos por investigación:', error);
    return { data: null, error: 'Error inesperado' };
  }
};

// Obtener reclutamientos por participante
export const obtenerReclutamientosPorParticipante = async (participanteId: string) => {
  try {
    const { data, error } = await supabase
      .from('vista_reclutamientos_completa')
      .select('*')
      .eq('participantes_id', participanteId)
      .order('fecha_asignado', { ascending: false });

    if (error) {
      console.error('Error obteniendo reclutamientos por participante:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error inesperado obteniendo reclutamientos por participante:', error);
    return { data: null, error: 'Error inesperado' };
  }
}; 