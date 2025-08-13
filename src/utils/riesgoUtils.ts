// Tipos de riesgo disponibles
export type NivelRiesgo = 'alto' | 'medio' | 'bajo' | 'completado' | 'sin_fecha';

// Función para obtener el color del badge de riesgo
export const getRiesgoBadgeVariant = (nivel: string): 'danger' | 'warning' | 'success' | 'info' | 'secondary' => {
  switch (nivel) {
    case 'alto': return 'danger';
    case 'medio': return 'warning';
    case 'bajo': return 'success';
    case 'completado': return 'info';
    case 'sin_fecha': return 'secondary';
    default: return 'secondary';
  }
};

// Función para obtener el nombre del icono del nivel de riesgo
export const getRiesgoIconName = (nivel: string): string => {
  switch (nivel) {
    case 'alto': 
      return 'AlertTriangleIcon';
    case 'medio': 
      return 'ExclamationTriangleIcon';
    case 'bajo': 
      return 'CheckCircleIcon';
    case 'completado': 
      return 'CheckCircleIcon';
    case 'sin_fecha': 
      return 'QuestionMarkCircleIcon';
    default: 
      return 'QuestionMarkCircleIcon';
  }
};

// Función para obtener el texto del nivel de riesgo
export const getRiesgoText = (nivel: NivelRiesgo): string => {
  switch (nivel) {
    case 'bajo': return 'Bajo';
    case 'medio': return 'Medio';
    case 'alto': return 'Alto';
    case 'critico': return 'Crítico';
    default: return 'Sin definir';
  }
};

// Función para obtener la descripción del nivel de riesgo
export const getRiesgoDescripcion = (nivel: string, diasRestantes?: number): string => {
  switch (nivel) {
    case 'alto':
      return `Riesgo alto - ${diasRestantes || 0} días restantes`;
    case 'medio':
      return `Atención requerida - ${diasRestantes || 0} días restantes`;
    case 'bajo':
      return `En tiempo - ${diasRestantes || 0} días restantes`;
    case 'completado':
      return 'Investigación completada';
    case 'sin_fecha':
      return 'Sin fecha de finalización definida';
    default:
      return 'Estado de riesgo no definido';
  }
};

// Función para obtener la prioridad numérica del riesgo (para ordenamiento)
export const getRiesgoPrioridad = (nivel: string): number => {
  switch (nivel) {
    case 'alto': return 3;
    case 'medio': return 2;
    case 'bajo': return 1;
    case 'sin_fecha': return 0;
    case 'completado': return -1;
    default: return 0;
  }
};
