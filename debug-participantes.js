const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eloncaptettdvrvwyjji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExNjAyNCwiZXhwIjoyMDY1NjkyMDI0fQ.b4-pu9KmNmn6jYYv1HgSKtoSRzjZDEEpdhtHcXxqWxw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugParticipantes() {
  console.log('🔍 Debug de participantes...');
  
  // 1. Verificar el reclutamiento
  const { data: reclutamiento, error: errorReclutamiento } = await supabase
    .from('reclutamientos')
    .select('*')
    .eq('id', '5a812f25-0205-43ff-bc77-19dc3d4a0a64')
    .single();
    
  console.log('📋 Reclutamiento:', reclutamiento);
  console.log('❌ Error reclutamiento:', errorReclutamiento);
  
  if (reclutamiento) {
    // 2. Verificar el participante
    const { data: participante, error: errorParticipante } = await supabase
      .from('participantes')
      .select('*')
      .eq('id', reclutamiento.participantes_id)
      .single();
      
    console.log('👤 Participante:', participante);
    console.log('❌ Error participante:', errorParticipante);
  }
}

debugParticipantes().catch(console.error); 