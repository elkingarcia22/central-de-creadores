const http = require('http');

function checkStorybook() {
  const options = {
    hostname: 'localhost',
    port: 6006,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log('✅ Storybook está funcionando correctamente!');
    console.log(`🌐 URL: http://localhost:6006`);
    console.log(`📊 Status: ${res.statusCode}`);
    console.log('');
    console.log('🎨 Para ver el sistema de diseño:');
    console.log('   - Abre http://localhost:6006 en tu navegador');
    console.log('   - Ve a "Design System/Overview"');
    console.log('   - Explora los colores y componentes');
    console.log('');
    console.log('📱 Para ver en diferentes dispositivos:');
    console.log('   - Usa el panel de Viewport');
    console.log('   - Prueba Mobile, Tablet, Desktop');
  });

  req.on('error', (err) => {
    console.log('❌ Storybook no está funcionando');
    console.log('💡 Intenta ejecutar: npx storybook dev -p 6006');
  });

  req.on('timeout', () => {
    console.log('⏰ Timeout - Storybook puede estar iniciando...');
    console.log('💡 Espera unos segundos y vuelve a intentar');
  });

  req.end();
}

checkStorybook();
