// Script de prueba para verificar catálogos del libreto
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar las mismas variables de entorno que el proyecto)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'tu-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCatalogos() {
  console.log('🔍 Probando carga de catálogos del libreto...\n');

  try {
    // Probar plataformas
    console.log('📊 Probando plataformas...');
    const { data: plataformas, error: errorPlataformas } = await supabase
      .from('plataformas_cat')
      .select('*')
      .order('nombre');
    
    if (errorPlataformas) {
      console.error('❌ Error en plataformas:', errorPlataformas);
    } else {
      console.log('✅ Plataformas cargadas:', plataformas.length);
      console.log('   Datos:', plataformas.slice(0, 3));
    }

    // Probar roles empresa
    console.log('\n📊 Probando roles empresa...');
    const { data: roles, error: errorRoles } = await supabase
      .from('roles_empresa')
      .select('*')
      .order('nombre');
    
    if (errorRoles) {
      console.error('❌ Error en roles empresa:', errorRoles);
    } else {
      console.log('✅ Roles empresa cargados:', roles.length);
      console.log('   Datos:', roles.slice(0, 3));
    }

    // Probar industrias
    console.log('\n📊 Probando industrias...');
    const { data: industrias, error: errorIndustrias } = await supabase
      .from('industrias')
      .select('*')
      .order('nombre');
    
    if (errorIndustrias) {
      console.error('❌ Error en industrias:', errorIndustrias);
    } else {
      console.log('✅ Industrias cargadas:', industrias.length);
      console.log('   Datos:', industrias.slice(0, 3));
    }

    // Probar modalidades
    console.log('\n📊 Probando modalidades...');
    const { data: modalidades, error: errorModalidades } = await supabase
      .from('modalidades')
      .select('*')
      .order('nombre');
    
    if (errorModalidades) {
      console.error('❌ Error en modalidades:', errorModalidades);
    } else {
      console.log('✅ Modalidades cargadas:', modalidades.length);
      console.log('   Datos:', modalidades.slice(0, 3));
    }

    // Probar tamaños empresa
    console.log('\n📊 Probando tamaños empresa...');
    const { data: tamanos, error: errorTamanos } = await supabase
      .from('tamanos_empresa')
      .select('*')
      .order('nombre');
    
    if (errorTamanos) {
      console.error('❌ Error en tamaños empresa:', errorTamanos);
    } else {
      console.log('✅ Tamaños empresa cargados:', tamanos.length);
      console.log('   Datos:', tamanos.slice(0, 3));
    }

    // Probar tipos prueba
    console.log('\n📊 Probando tipos prueba...');
    const { data: tipos, error: errorTipos } = await supabase
      .from('tipos_prueba_cat')
      .select('*')
      .order('nombre');
    
    if (errorTipos) {
      console.error('❌ Error en tipos prueba:', errorTipos);
    } else {
      console.log('✅ Tipos prueba cargados:', tipos.length);
      console.log('   Datos:', tipos.slice(0, 3));
    }

    // Probar países
    console.log('\n📊 Probando países...');
    const { data: paises, error: errorPaises } = await supabase
      .from('paises')
      .select('*')
      .order('nombre');
    
    if (errorPaises) {
      console.error('❌ Error en países:', errorPaises);
    } else {
      console.log('✅ Países cargados:', paises.length);
      console.log('   Datos:', paises.slice(0, 3));
    }

    console.log('\n🎯 Resumen de catálogos:');
    console.log(`   Plataformas: ${plataformas?.length || 0}`);
    console.log(`   Roles empresa: ${roles?.length || 0}`);
    console.log(`   Industrias: ${industrias?.length || 0}`);
    console.log(`   Modalidades: ${modalidades?.length || 0}`);
    console.log(`   Tamaños empresa: ${tamanos?.length || 0}`);
    console.log(`   Tipos prueba: ${tipos?.length || 0}`);
    console.log(`   Países: ${paises?.length || 0}`);

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar la prueba
testCatalogos();
