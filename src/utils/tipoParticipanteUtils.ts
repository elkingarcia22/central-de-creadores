export type TipoParticipante = 'externo' | 'interno' | 'friend_family';

export const getTipoParticipanteVariant = (tipo: TipoParticipante): 'accent-cyan' | 'accent-emerald' | 'accent-violet' => {
  switch (tipo) {
    case 'externo': return 'accent-cyan';
    case 'interno': return 'accent-emerald';
    case 'friend_family': return 'accent-violet';
    default: return 'accent-cyan';
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
