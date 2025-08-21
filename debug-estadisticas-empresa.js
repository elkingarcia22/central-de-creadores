const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugEstadisticas() {
  const empresaId = '56ae11ec-f6b4-4066-9414-e51adfbebee2'; // FinanceHub International
  
  console.log('🔍 Debuggeando estadísticas para empresa:', empresaId);
  
  try {
    // 1. Verificar que la empresa existe
    const { data: empresa, error: errorEmpresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single();
    
    console.log('📊 Empresa encontrada:', empresa ? 'SÍ' : 'NO');
    if (errorEmpresa) console.log('❌ Error empresa:', errorEmpresa);
    
    // 2. Verificar participantes
    const { data: participantes, error: errorParticipantes } = await supabase
      .from('participantes')
      .select('id, nombre, empresa_id')
      .eq('empresa_id', empresaId);
    
    console.log('📊 Participantes encontrados:', participantes?.length || 0);
    if (participantes?.length > 0) {
      console.log('📋 Participantes:', participantes.map(p => ({ id: p.id, nombre: p.nombre })));
    }
    if (errorParticipantes) console.log('❌ Error participantes:', errorParticipantes);
    
    // 3. Verificar estado finalizado
    const { data: estadosData } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre')
      .ilike('nombre', '%finalizado%');
    
    console.log('📊 Estados finalizados encontrados:', estadosData?.length || 0);
    if (estadosData?.length > 0) {
      console.log('📋 Estados:', estadosData);
    }
    
    // 4. Verificar reclutamientos
    if (participantes?.length > 0 && estadosData?.length > 0) {
      const participanteIds = participantes.map(p => p.id);
      const estadoFinalizadoId = estadosData[0].id;
      
      const { data: reclutamientos, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select('id, investigacion_id, participantes_id, estado_agendamiento')
        .eq('estado_agendamiento', estadoFinalizadoId)
        .in('participantes_id', participanteIds);
      
      console.log('📊 Reclutamientos finalizados encontrados:', reclutamientos?.length || 0);
      if (reclutamientos?.length > 0) {
        console.log('📋 Reclutamientos:', reclutamientos);
      }
      if (errorReclutamientos) console.log('❌ Error reclutamientos:', errorReclutamientos);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

debugEstadisticas();
