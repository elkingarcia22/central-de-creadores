import React from 'react';
import { 
  UserIcon, 
  MessageIcon, 
  AlertTriangleIcon,
  BuildingIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon
} from '../../components/icons';
import { InfoContainer, InfoItem } from '../ui/InfoContainer';
import { Chip } from '../ui/Chip';
import { Typography } from '../ui/Typography';
import { getTipoParticipanteVariant, getTipoParticipanteText } from '../../utils/tipoParticipanteUtils';
import { getEstadoParticipanteVariant } from '../../utils/estadoUtils';
import { getChipText } from '../../utils/chipUtils';

interface ParticipanteApoyo {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado_participante?: string;
  empresa_nombre?: string;
  rol_empresa?: string;
  departamento_nombre?: string;
  comentarios?: string;
  doleres_necesidades?: string;
  created_at?: string;
  updated_at?: string;
  tipo: 'externo' | 'interno' | 'friend_family';
}

interface InformacionParticipanteApoyoProps {
  participante: ParticipanteApoyo;
}

// Función para formatear fechas
const formatearFecha = (fecha: string) => {
  if (!fecha) return 'No especificado';
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return fecha;
  }
};

// Función para formatear edad
const calcularEdad = (fechaNacimiento: string) => {
  if (!fechaNacimiento) return null;
  try {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  } catch (error) {
    return null;
  }
};

export const InformacionParticipanteApoyo: React.FC<InformacionParticipanteApoyoProps> = ({ 
  participante 
}) => {
  if (!participante) {
    return (
      <div className="flex items-center justify-center h-32">
        <Typography variant="body1" color="secondary">
          No hay información del participante disponible
        </Typography>
      </div>
    );
  }

  const edad = calcularEdad(participante.fecha_nacimiento || '');

  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <InfoContainer 
        title="Información Básica"
        icon={<UserIcon className="w-4 h-4" />}
      >
        <InfoItem 
          label="Nombre Completo"
          value={participante.nombre}
        />
        <InfoItem 
          label="Email"
          value={participante.email}
        />
        <InfoItem 
          label="Tipo de Participante"
          value={
            <Chip 
              variant={getTipoParticipanteVariant(participante.tipo)}
              size="sm"
            >
              {getTipoParticipanteText(participante.tipo)}
            </Chip>
          }
        />
        <InfoItem 
          label="Estado"
          value={
            <Chip 
              variant={getEstadoParticipanteVariant(participante.estado_participante || 'disponible')}
              size="sm"
            >
              {getChipText(participante.estado_participante || 'disponible')}
            </Chip>
          }
        />
        {participante.telefono && (
          <InfoItem 
            label="Teléfono"
            value={
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-gray-500" />
                {participante.telefono}
              </div>
            }
          />
        )}
        {participante.fecha_nacimiento && (
          <InfoItem 
            label="Fecha de Nacimiento"
            value={
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                {formatearFecha(participante.fecha_nacimiento)}
                {edad && (
                  <Chip variant="secondary" size="sm">
                    {edad} años
                  </Chip>
                )}
              </div>
            }
          />
        )}
        {participante.genero && (
          <InfoItem 
            label="Género"
            value={participante.genero}
          />
        )}
      </InfoContainer>

      {/* Información Organizacional */}
      <InfoContainer 
        title={participante.tipo === 'externo' ? 'Información de Empresa' : 'Información Organizacional'}
        icon={<BuildingIcon className="w-4 h-4" />}
      >
        {participante.tipo === 'externo' && participante.empresa_nombre && (
          <InfoItem 
            label="Empresa" 
            value={participante.empresa_nombre}
          />
        )}
        {participante.rol_empresa && (
          <InfoItem 
            label="Rol en la Empresa" 
            value={participante.rol_empresa}
          />
        )}
        {(participante.tipo === 'interno' || participante.tipo === 'friend_family') && participante.departamento_nombre && (
          <InfoItem 
            label="Departamento" 
            value={participante.departamento_nombre}
          />
        )}
      </InfoContainer>

      {/* Información del Sistema */}
      <InfoContainer 
        title="Información del Sistema"
        icon={<ClockIcon className="w-4 h-4" />}
      >
        <InfoItem 
          label="Fecha de Registro"
          value={formatearFecha(participante.created_at || '')}
        />
        <InfoItem 
          label="Última Actualización"
          value={formatearFecha(participante.updated_at || '')}
        />
      </InfoContainer>

      {/* Información Adicional */}
      {participante.comentarios && (
        <InfoContainer 
          title="Comentarios"
          icon={<MessageIcon className="w-4 h-4" />}
          variant="bordered"
          padding="md"
        >
          <div className="col-span-full">
            <Typography variant="body2" color="secondary">
              {participante.comentarios}
            </Typography>
          </div>
        </InfoContainer>
      )}

      {participante.doleres_necesidades && (
        <InfoContainer 
          title="Dolores y Necesidades"
          icon={<AlertTriangleIcon className="w-4 h-4" />}
          variant="bordered"
          padding="md"
        >
          <div className="col-span-full">
            <Typography variant="body2" color="secondary">
              {participante.doleres_necesidades}
            </Typography>
          </div>
        </InfoContainer>
      )}
    </div>
  );
};
