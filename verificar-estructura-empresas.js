const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

async function verificarEstructuraEmpresas() {
  try {
    console.log('🔍 Verificando estructura de tabla empresas...');
    
    // Obtener estructura de la tabla
    const { data: estructura, error: errorEstructura } = await supabaseServer
      .from('empresas')
      .select('*')
      .limit(1);
    
    if (errorEstructura) {
      console.error('❌ Error obteniendo estructura:', errorEstructura);
      return;
    }
    
    if (estructura && estructura.length > 0) {
      console.log('\n📋 CAMPOS DISPONIBLES EN TABLA EMPRESAS:');
      console.log('==========================================');
      
      const campos = Object.keys(estructura[0]);
      campos.forEach((campo, index) => {
        const valor = estructura[0][campo];
        const tipo = typeof valor;
        const esNull = valor === null;
        const esArray = Array.isArray(valor);
        const esObject = typeof valor === 'object' && valor !== null && !esArray;
        
        let descripcion = '';
        if (esNull) descripcion = ' (NULL)';
        else if (esArray) descripcion = ` (Array: ${valor.length} elementos)`;
        else if (esObject) descripcion = ' (Objeto)';
        else descripcion = ` (${tipo}: ${valor})`;
        
        console.log(`${index + 1}. ${campo}${descripcion}`);
      });
      
      console.log('\n📊 EJEMPLO DE DATOS:');
      console.log('=====================');
      console.log(JSON.stringify(estructura[0], null, 2));
    } else {
      console.log('⚠️ No hay datos en la tabla empresas');
    }
    
    // Obtener algunos registros para ver ejemplos
    const { data: ejemplos, error: errorEjemplos } = await supabaseServer
      .from('empresas')
      .select('*')
      .limit(3);
    
    if (!errorEjemplos && ejemplos && ejemplos.length > 0) {
      console.log('\n🏢 EJEMPLOS DE EMPRESAS:');
      console.log('========================');
      ejemplos.forEach((empresa, index) => {
        console.log(`\n${index + 1}. Empresa: ${empresa.nombre || 'Sin nombre'}`);
        console.log(`   ID: ${empresa.id}`);
        console.log(`   Estado: ${empresa.estado || 'Sin estado'}`);
        console.log(`   Tamaño: ${empresa.tamano || 'Sin tamaño'}`);
        console.log(`   Industria: ${empresa.industria || 'Sin industria'}`);
        console.log(`   País: ${empresa.pais || 'Sin país'}`);
        console.log(`   Departamento: ${empresa.departamento || 'Sin departamento'}`);
        console.log(`   Creado: ${empresa.created_at || 'Sin fecha'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verificarEstructuraEmpresas(); 