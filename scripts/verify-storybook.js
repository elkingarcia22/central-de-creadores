const http = require('http');

console.log('🔍 VERIFICANDO STORYBOOK...');
console.log('============================');
console.log('');

function checkStorybook() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 6006,
      path: '/',
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Storybook está funcionando correctamente!');
          console.log(`🌐 URL: http://localhost:6006`);
          console.log(`📊 Status: ${res.statusCode}`);
          console.log('');
          console.log('🎨 STORIES DISPONIBLES:');
          console.log('   • Design System/Simple Colors - Paleta de colores');
          console.log('   • UI/Card - Componente Card');
          console.log('   • UI/Input - Componente Input');
          console.log('   • UI/Modal - Componente Modal');
          console.log('');
          console.log('🚀 INSTRUCCIONES:');
          console.log('   1. Abre http://localhost:6006 en tu navegador');
          console.log('   2. Ve a "Design System/Simple Colors"');
          console.log('   3. Explora los colores del sistema');
          console.log('   4. Prueba los componentes de UI');
          console.log('');
          console.log('💡 Si la página está en blanco:');
          console.log('   • Refresca la página (F5)');
          console.log('   • Espera unos segundos más');
          console.log('   • Verifica la consola del navegador');
          resolve(true);
        } else {
          console.log(`❌ Storybook respondió con status: ${res.statusCode}`);
          reject(new Error(`Status: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Error conectando con Storybook');
      console.log('💡 Posibles soluciones:');
      console.log('   • Verifica que Storybook esté ejecutándose');
      console.log('   • Ejecuta: npx storybook dev -p 6006');
      console.log('   • Espera unos segundos más');
      reject(err);
    });

    req.on('timeout', () => {
      console.log('⏰ Timeout - Storybook puede estar iniciando...');
      console.log('💡 Espera unos segundos y vuelve a intentar');
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

checkStorybook()
  .then(() => {
    console.log('🎉 ¡Storybook está listo para usar!');
  })
  .catch((err) => {
    console.log('❌ Problema con Storybook');
    console.log('🔧 Soluciones:');
    console.log('   1. Ejecuta: npx storybook dev -p 6006');
    console.log('   2. Espera 30-60 segundos');
    console.log('   3. Abre http://localhost:6006');
    console.log('   4. Si persiste, reinicia el proceso');
  });
