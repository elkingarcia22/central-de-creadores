import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useRol } from '../contexts/RolContext';
import { usePermisos } from '../utils/permisosUtils';

export default function DiagnosticoPermisos() {
  const { userProfile } = useUser();
  const { rolSeleccionado, rolesDisponibles } = useRol();
  const { tienePermiso, debeFiltrarPorAsignacion, esAdministrador, usuarioId } = usePermisos();

  const diagnosticInfo = {
    usuario: {
      id: userProfile?.id,
      email: userProfile?.email,
      nombre: userProfile?.full_name,
    },
    roles: {
      seleccionado: rolSeleccionado,
      disponibles: rolesDisponibles,
      esAdmin: esAdministrador(),
    },
    permisos: {
      investigaciones: {
        ver: tienePermiso('investigaciones', 'ver'),
        crear: tienePermiso('investigaciones', 'crear'),
        editar: tienePermiso('investigaciones', 'editar'),
        filtroAsignacion: debeFiltrarPorAsignacion('investigaciones'),
      },
      reclutamientos: {
        ver: tienePermiso('reclutamientos', 'ver'),
        crear: tienePermiso('reclutamientos', 'crear'),
        editar: tienePermiso('reclutamientos', 'editar'),
        filtroAsignacion: debeFiltrarPorAsignacion('reclutamientos'),
      },
    },
    localStorage: {
      rolSeleccionado: typeof window !== 'undefined' ? localStorage.getItem('rolSeleccionado') : 'N/A',
      rolesDisponibles: typeof window !== 'undefined' ? localStorage.getItem('rolesDisponibles') : 'N/A',
    },
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Diagnóstico de Permisos</h3>
      <div className="text-xs space-y-1">
        <div><strong>Usuario:</strong> {diagnosticInfo.usuario.nombre}</div>
        <div><strong>Rol Activo:</strong> {diagnosticInfo.roles.seleccionado}</div>
        <div><strong>Es Admin:</strong> {diagnosticInfo.roles.esAdmin ? 'Sí' : 'No'}</div>
        <div><strong>Permisos Inv:</strong> Ver: {diagnosticInfo.permisos.investigaciones.ver ? '✓' : '✗'}, Filtro: {diagnosticInfo.permisos.investigaciones.filtroAsignacion ? '✓' : '✗'}</div>
        <div><strong>Permisos Rec:</strong> Ver: {diagnosticInfo.permisos.reclutamientos.ver ? '✓' : '✗'}, Filtro: {diagnosticInfo.permisos.reclutamientos.filtroAsignacion ? '✓' : '✗'}</div>
      </div>
    </div>
  );
}
