import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

interface Participante {
  id: string;
  nombre: string;
  empresa_id: string;
  total_participaciones: number;
  fecha_ultima_participacion: string | null;
}

interface TestParticipantesProps {
  participantes: Participante[];
}

export default function TestParticipantes({ participantes }: TestParticipantesProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Participantes</h1>
      
      <div className="space-y-4">
        {participantes.map((participante) => (
          <div key={participante.id} className="border p-4 rounded-lg bg-white">
            <h3 className="font-semibold text-lg">{participante.nombre}</h3>
            <p className="text-sm text-gray-600">
              Participaciones: <span className="font-bold">{participante.total_participaciones}</span>
            </p>
            {participante.fecha_ultima_participacion && (
              <p className="text-sm text-gray-600">
                Última participación: {new Date(participante.fecha_ultima_participacion).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-blue-500 mt-2">
              ID: {participante.id}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(participantes, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    console.log('🚀 Iniciando test de participantes...');
    
    // 1. Obtener empresa específica
    const empresaId = '56ae11ec-f6b4-4066-9414-e51adfbebee2';
    
    const { data: empresa, error: errorEmpresa } = await supabaseServer
      .from('empresas')
      .select('id, nombre')
      .eq('id', empresaId)
      .single();

    if (errorEmpresa) {
      console.error('❌ Error obteniendo empresa:', errorEmpresa);
      return { props: { participantes: [] } };
    }

    console.log('🏢 Empresa encontrada:', empresa.nombre);

    // 2. Obtener participantes de la empresa
    const { data: participantes, error: errorParticipantes } = await supabaseServer
      .from('participantes')
      .select('id, nombre, empresa_id')
      .eq('empresa_id', empresaId);

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return { props: { participantes: [] } };
    }

    console.log('📊 Participantes encontrados:', participantes?.length || 0);
    console.log('Participantes:', participantes);

    if (!participantes || participantes.length === 0) {
      console.log('❌ No hay participantes para esta empresa');
      return { props: { participantes: [] } };
    }

    // 3. Obtener estado "Finalizado"
    const { data: estadoFinalizado, error: errorEstado } = await supabaseServer
      .from('estado_agendamiento_cat')
      .select('id, nombre')
      .eq('nombre', 'Finalizado')
      .single();

    if (errorEstado || !estadoFinalizado) {
      console.error('❌ Error obteniendo estado Finalizado:', errorEstado);
      return { props: { participantes: [] } };
    }

    console.log('📋 Estado Finalizado:', estadoFinalizado);

    // 4. Obtener reclutamientos finalizados para estos participantes
    const participanteIds = participantes.map(p => p.id);
    
    const { data: reclutamientos, error: errorReclutamientos } = await supabaseServer
      .from('reclutamientos')
      .select('id, participantes_id, fecha_sesion, estado_agendamiento')
      .eq('estado_agendamiento', estadoFinalizado.id)
      .in('participantes_id', participanteIds);

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return { props: { participantes: [] } };
    }

    console.log('📈 Reclutamientos finalizados encontrados:', reclutamientos?.length || 0);
    console.log('Reclutamientos:', reclutamientos);

    // 5. Calcular participaciones por participante
    const participacionesPorParticipante: { [key: string]: number } = {};
    const fechaUltimaPorParticipante: { [key: string]: string } = {};

    if (reclutamientos && reclutamientos.length > 0) {
      reclutamientos.forEach(reclutamiento => {
        const participanteId = reclutamiento.participantes_id;
        
        // Contar participaciones
        if (!participacionesPorParticipante[participanteId]) {
          participacionesPorParticipante[participanteId] = 0;
        }
        participacionesPorParticipante[participanteId]++;
        
        // Actualizar fecha de última participación
        if (!fechaUltimaPorParticipante[participanteId] || 
            new Date(reclutamiento.fecha_sesion) > new Date(fechaUltimaPorParticipante[participanteId])) {
          fechaUltimaPorParticipante[participanteId] = reclutamiento.fecha_sesion;
        }
      });
    }

    console.log('📊 Participaciones por participante:', participacionesPorParticipante);
    console.log('📅 Fechas últimas por participante:', fechaUltimaPorParticipante);

    // 6. Actualizar datos de participantes
    const participantesActualizados = participantes.map(participante => ({
      ...participante,
      total_participaciones: participacionesPorParticipante[participante.id] || 0,
      fecha_ultima_participacion: fechaUltimaPorParticipante[participante.id] || null
    }));

    console.log('✅ Participantes actualizados:', participantesActualizados);

    return {
      props: {
        participantes: participantesActualizados
      }
    };

  } catch (error) {
    console.error('❌ Error general:', error);
    return {
      props: { participantes: [] }
    };
  }
};
