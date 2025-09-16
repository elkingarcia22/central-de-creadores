export type TipoParticipante = 'externo' | 'interno' | 'friend_family';

export const getTipoParticipanteVariant = (tipo: TipoParticipante): 'accent-cyan' | 'accent-blue' | 'accent-black' => {
  switch (tipo) {
    case 'externo': return 'accent-black';
    case 'interno': return 'accent-blue';
    case 'friend_family': return 'accent-black';
    default: return 'accent-black';
  }
};

export const getTipoParticipanteText = (tipo: TipoParticipante): string => {
  switch (tipo) {
    case 'externo': return 'Externo';
    case 'interno': return 'Interno';
    case 'friend_family': return 'Friend & Family';
    default: return 'Externo';
  }
};

export const getTipoParticipanteDescripcion = (tipo: TipoParticipante): string => {
  switch (tipo) {
    case 'externo': return 'Participante externo a la empresa';
    case 'interno': return 'Participante interno de la empresa';
    case 'friend_family': return 'Participante friend & family';
    default: return 'Tipo de participante no definido';
  }
};

// Función para determinar el tipo de participante basado en los datos
export const getTipoParticipante = (participante: any): TipoParticipante => {
  if (participante.tipo) {
    return participante.tipo as TipoParticipante;
  }
  
  // Lógica de fallback basada en otros campos
  if (participante.empresa_nombre || participante.empresa_id) {
    return 'externo';
  }
  
  if (participante.departamento || participante.departamento_id) {
    return 'interno';
  }
  
  // Por defecto, asumir externo
  return 'externo';
};

// Función para obtener el badge del tipo de participante
export const getTipoParticipanteBadge = (participante: any) => {
  const tipo = getTipoParticipante(participante);
  return {
    variant: getTipoParticipanteVariant(tipo),
    text: getTipoParticipanteText(tipo)
  };
};
