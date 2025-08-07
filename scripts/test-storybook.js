const http = require('http');

console.log('🧪 PROBANDO STORYBOOK...');
console.log('========================');
console.log('');

function testStorybook() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 6006,
      path: '/',
      method: 'GET',
      timeout: 15000
    };

    const req = http.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Storybook está funcionando!');
        console.log('🌐 URL: http://localhost:6006');
        console.log('');
        console.log('🎨 STORIES DISPONIBLES:');
        console.log('   • Design System/Color System - Sistema de colores');
        console.log('   • UI/SimpleButton - Componente botón');
        console.log('');
        console.log('🚀 INSTRUCCIONES:');
        console.log('   1. Abre http://localhost:6006 en tu navegador');
        console.log('   2. Ve a "Design System/Color System"');
        console.log('   3. Explora los colores del sistema');
        console.log('   4. Prueba el componente SimpleButton');
        console.log('');
        console.log('💡 SI LA PÁGINA ESTÁ EN BLANCO:');
        console.log('   • Espera 30-60 segundos más');
        console.log('   • Refresca la página (F5)');
        console.log('   • Verifica la consola del navegador (F12)');
        console.log('   • Intenta con otro navegador');
        resolve(true);
      } else {
        console.log(`❌ Storybook respondió con status: ${res.statusCode}`);
        reject(new Error(`Status: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      console.log('❌ Error conectando con Storybook');
      console.log('💡 Posibles soluciones:');
      console.log('   • Verifica que Storybook esté ejecutándose');
      console.log('   • Ejecuta: npx storybook dev -p 6006');
      console.log('   • Espera 30-60 segundos');
      reject(err);
    });

    req.on('timeout', () => {
      console.log('⏰ Timeout - Storybook puede estar iniciando...');
      console.log('💡 Espera unos segundos más');
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

testStorybook()
  .then(() => {
    console.log('');
    console.log('🎉 ¡Storybook está listo para usar!');
    console.log('');
    console.log('🔧 COMANDOS ÚTILES:');
    console.log('   • npx storybook dev -p 6006');
    console.log('   • node scripts/test-storybook.js');
    console.log('   • pkill -f storybook (para detener)');
  })
  .catch((err) => {
    console.log('');
    console.log('❌ Problema con Storybook');
    console.log('🔧 Soluciones:');
    console.log('   1. Ejecuta: npx storybook dev -p 6006');
    console.log('   2. Espera 30-60 segundos');
    console.log('   3. Abre http://localhost:6006');
    console.log('   4. Si persiste, reinicia el proceso');
  });
