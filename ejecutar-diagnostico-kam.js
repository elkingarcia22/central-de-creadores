const http = require('http');

async function ejecutarDiagnostico() {
  console.log('🔍 Ejecutando diagnóstico de KAMs y empresas...\n');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/diagnostico-kam-empresas',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const resultado = JSON.parse(data);
          resolve(resultado);
        } catch (error) {
          reject(new Error('Error al parsear respuesta: ' + error.message));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Ejecutar diagnóstico
ejecutarDiagnostico()
  .then((resultado) => {
    console.log('✅ Diagnóstico completado exitosamente');
    console.log('\n📊 RESUMEN:');
    console.log(`   Total empresas: ${resultado.data.resumen.totalEmpresas}`);
    console.log(`   Empresas con KAM: ${resultado.data.resumen.empresasConKam}`);
    console.log(`   Empresas sin KAM: ${resultado.data.resumen.empresasSinKam}`);
    console.log(`   KAMs inválidos: ${resultado.data.resumen.kamsInvalidos}`);
    console.log(`   Empresas actualizadas: ${resultado.data.resumen.empresasActualizadas}`);

    if (resultado.data.empresasSinKam.length > 0) {
      console.log('\n❌ EMPRESAS SIN KAM:');
      resultado.data.empresasSinKam.forEach(empresa => {
        console.log(`   - ${empresa.nombre} (ID: ${empresa.id})`);
      });
    }

    if (resultado.data.kamsInvalidos.length > 0) {
      console.log('\n⚠️ KAMS INVÁLIDOS:');
      resultado.data.kamsInvalidos.forEach(empresa => {
        console.log(`   - ${empresa.nombre} (KAM ID: ${empresa.kam_id})`);
      });
    }

    console.log('\n📋 RESULTADO FINAL:');
    resultado.data.resultadoFinal.forEach(empresa => {
      const kamInfo = empresa.usuarios ? `${empresa.usuarios.nombre} (${empresa.usuarios.correo})` : 'Sin KAM';
      console.log(`   - ${empresa.nombre}: ${kamInfo}`);
    });

    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Prueba el modal "Crear Participante Externo"');
    console.log('   2. Selecciona una empresa');
    console.log('   3. Verifica que el KAM se auto-seleccione correctamente');
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar diagnóstico:', error.message);
    console.log('\n💡 Asegúrate de que:');
    console.log('   1. El servidor Next.js esté ejecutándose (npm run dev)');
    console.log('   2. El endpoint /api/diagnostico-kam-empresas esté disponible');
  }); 