export const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return '-';
  
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

export const formatearFechaHora = (fecha: string | null | undefined): string => {
  if (!fecha) return '-';
  
  try {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

export const formatearFechaRelativa = (fecha: string | null | undefined): string => {
  if (!fecha) return '-';
  
  try {
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    
    return `Hace ${Math.floor(diffDays / 365)} años`;
  } catch {
    return '-';
  }
};

// Función para convertir fechas ISO a formato YYYY-MM-DD para inputs de tipo date
export const formatearFechaParaInput = (fecha: string | null | undefined): string => {
  if (!fecha) return '';
  
  try {
    const date = new Date(fecha);
    // Verificar que la fecha es válida
    if (isNaN(date.getTime())) return '';
    
    // Formatear como YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}; 