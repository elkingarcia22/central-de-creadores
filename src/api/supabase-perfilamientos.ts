// =====================================================
// SERVICIO API PARA PERFILAMIENTOS DE PARTICIPANTES
// =====================================================

import { supabase } from './supabase';
import { 
  PerfilamientoParticipante, 
  PerfilamientoParticipanteForm, 
  EstadisticasPerfilamiento,
  CategoriaPerfilamiento 
} from '../types/perfilamientos';

export class PerfilamientosService {
  // Crear nuevo perfilamiento
  static async crearPerfilamiento(
    perfilamiento: PerfilamientoParticipanteForm
  ): Promise<{ data: PerfilamientoParticipante | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('perfilamientos_participantes')
        .insert([perfilamiento])
        .select()
        .single();

      if (error) {
        console.error('Error creando perfilamiento:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado creando perfilamiento:', error);
      return { data: null, error: 'Error inesperado al crear perfilamiento' };
    }
  }

  // Obtener perfilamientos por participante
  static async obtenerPerfilamientosPorParticipante(
    participanteId: string
  ): Promise<{ data: PerfilamientoParticipante[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vista_perfilamientos_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .order('fecha_perfilamiento', { ascending: false });

      if (error) {
        console.error('Error obteniendo perfilamientos:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado obteniendo perfilamientos:', error);
      return { data: null, error: 'Error inesperado al obtener perfilamientos' };
    }
  }

  // Obtener perfilamientos por categoría
  static async obtenerPerfilamientosPorCategoria(
    participanteId: string,
    categoria: CategoriaPerfilamiento
  ): Promise<{ data: PerfilamientoParticipante[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vista_perfilamientos_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .eq('categoria_perfilamiento', categoria)
        .order('fecha_perfilamiento', { ascending: false });

      if (error) {
        console.error('Error obteniendo perfilamientos por categoría:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado obteniendo perfilamientos por categoría:', error);
      return { data: null, error: 'Error inesperado al obtener perfilamientos por categoría' };
    }
  }

  // Obtener estadísticas de perfilamiento
  static async obtenerEstadisticasPerfilamiento(
    participanteId: string
  ): Promise<{ data: EstadisticasPerfilamiento[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .rpc('obtener_estadisticas_perfilamiento_participante', {
          p_participante_id: participanteId
        });

      if (error) {
        console.error('Error obteniendo estadísticas:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado obteniendo estadísticas:', error);
      return { data: null, error: 'Error inesperado al obtener estadísticas' };
    }
  }

  // Obtener perfilamiento más reciente por categoría
  static async obtenerPerfilamientoRecienteCategoria(
    participanteId: string,
    categoria: CategoriaPerfilamiento
  ): Promise<{ data: PerfilamientoParticipante | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .rpc('obtener_perfilamiento_reciente_categoria', {
          p_participante_id: participanteId,
          p_categoria: categoria
        });

      if (error) {
        console.error('Error obteniendo perfilamiento reciente:', error);
        return { data: null, error: error.message };
      }

      // Si no hay datos, retornar null
      if (!data || data.length === 0) {
        return { data: null, error: null };
      }

      return { data: data[0] as any, error: null };
    } catch (error) {
      console.error('Error inesperado obteniendo perfilamiento reciente:', error);
      return { data: null, error: 'Error inesperado al obtener perfilamiento reciente' };
    }
  }

  // Buscar perfilamientos
  static async buscarPerfilamientos(
    participanteId: string,
    termino: string
  ): Promise<{ data: PerfilamientoParticipante[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vista_perfilamientos_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .or(`observaciones.ilike.%${termino}%,contexto_interaccion.ilike.%${termino}%,valor_principal.ilike.%${termino}%`)
        .order('fecha_perfilamiento', { ascending: false });

      if (error) {
        console.error('Error buscando perfilamientos:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado buscando perfilamientos:', error);
      return { data: null, error: 'Error inesperado al buscar perfilamientos' };
    }
  }

  // Filtrar perfilamientos por categoría
  static async filtrarPerfilamientosPorCategoria(
    participanteId: string,
    categorias: CategoriaPerfilamiento[]
  ): Promise<{ data: PerfilamientoParticipante[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vista_perfilamientos_participantes')
        .select('*')
        .eq('participante_id', participanteId)
        .in('categoria_perfilamiento', categorias)
        .order('fecha_perfilamiento', { ascending: false });

      if (error) {
        console.error('Error filtrando perfilamientos:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado filtrando perfilamientos:', error);
      return { data: null, error: 'Error inesperado al filtrar perfilamientos' };
    }
  }

  // Actualizar perfilamiento
  static async actualizarPerfilamiento(
    id: string,
    actualizaciones: Partial<PerfilamientoParticipanteForm>
  ): Promise<{ data: PerfilamientoParticipante | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('perfilamientos_participantes')
        .update(actualizaciones)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando perfilamiento:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado actualizando perfilamiento:', error);
      return { data: null, error: 'Error inesperado al actualizar perfilamiento' };
    }
  }

  // Eliminar perfilamiento (soft delete)
  static async eliminarPerfilamiento(
    id: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('perfilamientos_participantes')
        .update({ activo: false })
        .eq('id', id);

      if (error) {
        console.error('Error eliminando perfilamiento:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error inesperado eliminando perfilamiento:', error);
      return { error: 'Error inesperado al eliminar perfilamiento' };
    }
  }

  // Obtener perfilamientos por usuario perfilador
  static async obtenerPerfilamientosPorUsuario(
    usuarioId: string
  ): Promise<{ data: PerfilamientoParticipante[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vista_perfilamientos_participantes')
        .select('*')
        .eq('usuario_perfilador_id', usuarioId)
        .order('fecha_perfilamiento', { ascending: false });

      if (error) {
        console.error('Error obteniendo perfilamientos por usuario:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado obteniendo perfilamientos por usuario:', error);
      return { data: null, error: 'Error inesperado al obtener perfilamientos por usuario' };
    }
  }
}
