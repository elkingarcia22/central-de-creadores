// ====================================
// UTILIDADES PARA USUARIOS DEL LIBRETO
// ====================================

import { obtenerLibretoPorInvestigacion } from '../api/supabase-libretos';

export interface UsuarioLibreto {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

/**
 * Obtiene los usuarios configurados en el libreto de una investigación
 * @param investigacionId - ID de la investigación
 * @returns Array de usuarios del libreto o array vacío si no hay libreto
 */
export const obtenerUsuariosDelLibreto = async (investigacionId: string): Promise<UsuarioLibreto[]> => {
  try {
    console.log('🔍 Obteniendo usuarios del libreto para investigación:', investigacionId);
    
    if (!investigacionId) {
      console.log('⚠️ No se proporcionó investigacionId');
      return [];
    }

    // Obtener el libreto de la investigación
    const libretoResult = await obtenerLibretoPorInvestigacion(investigacionId);
    
    if (libretoResult.error || !libretoResult.data) {
      console.log('ℹ️ No se encontró libreto para la investigación:', investigacionId);
      return [];
    }

    const libreto = libretoResult.data;
    const usuariosParticipantes = libreto.usuarios_participantes;

    if (!usuariosParticipantes || !Array.isArray(usuariosParticipantes) || usuariosParticipantes.length === 0) {
      console.log('ℹ️ No hay usuarios configurados en el libreto');
      return [];
    }

    console.log('📋 Usuarios encontrados en el libreto:', usuariosParticipantes.length);

    // Obtener los datos completos de los usuarios
    const usuariosCompletos = await obtenerDatosCompletosUsuarios(usuariosParticipantes);
    
    console.log('✅ Usuarios del libreto obtenidos:', usuariosCompletos.length);
    return usuariosCompletos;

  } catch (error) {
    console.error('❌ Error obteniendo usuarios del libreto:', error);
    return [];
  }
};

/**
 * Obtiene los datos completos de los usuarios por sus IDs
 * @param usuarioIds - Array de IDs de usuarios
 * @returns Array de usuarios con datos completos
 */
const obtenerDatosCompletosUsuarios = async (usuarioIds: string[]): Promise<UsuarioLibreto[]> => {
  try {
    console.log('🔍 Obteniendo datos completos de usuarios:', usuarioIds.length);
    
    // Hacer fetch a la API de usuarios
    const response = await fetch('/api/usuarios');
    
    if (!response.ok) {
      console.error('❌ Error en la respuesta de la API de usuarios:', response.status);
      return [];
    }

    const data = await response.json();
    const todosLosUsuarios = data.usuarios || [];

    console.log('📊 Total de usuarios disponibles:', todosLosUsuarios.length);

    // Filtrar solo los usuarios que están en el libreto
    const usuariosDelLibreto = todosLosUsuarios.filter((usuario: any) => 
      usuarioIds.includes(usuario.id)
    );

    console.log('✅ Usuarios del libreto encontrados:', usuariosDelLibreto.length);
    
    return usuariosDelLibreto.map((usuario: any) => ({
      id: usuario.id,
      full_name: usuario.full_name,
      email: usuario.email,
      avatar_url: usuario.avatar_url
    }));

  } catch (error) {
    console.error('❌ Error obteniendo datos completos de usuarios:', error);
    return [];
  }
};

/**
 * Combina usuarios del libreto con usuarios adicionales (para mantener funcionalidad existente)
 * @param usuariosLibreto - Usuarios del libreto
 * @param usuariosAdicionales - Usuarios adicionales (todos los usuarios)
 * @returns Array combinado sin duplicados
 */
export const combinarUsuarios = (usuariosLibreto: UsuarioLibreto[], usuariosAdicionales: UsuarioLibreto[]): UsuarioLibreto[] => {
  // Crear un Set con los IDs de usuarios del libreto para búsqueda rápida
  const idsLibreto = new Set(usuariosLibreto.map(u => u.id));
  
  // Agregar usuarios del libreto primero (prioridad)
  const usuariosCombinados = [...usuariosLibreto];
  
  // Agregar usuarios adicionales que no estén en el libreto
  usuariosAdicionales.forEach(usuario => {
    if (!idsLibreto.has(usuario.id)) {
      usuariosCombinados.push(usuario);
    }
  });
  
  console.log('🔄 Usuarios combinados:', {
    delLibreto: usuariosLibreto.length,
    adicionales: usuariosAdicionales.length,
    total: usuariosCombinados.length
  });
  
  return usuariosCombinados;
};
