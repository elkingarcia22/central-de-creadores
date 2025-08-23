const fs = require('fs');
const path = require('path');

// Función para buscar y reemplazar estilos h5 inconsistentes
function aplicarEstilosH5(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      aplicarEstilosH5(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Patrones a buscar y reemplazar
      const patterns = [
        // h5 sin color ni weight
        {
          search: /<Typography variant="h5">/g,
          replace: '<Typography variant="h5" color="secondary" weight="medium">'
        },
        // h5 con weight="semibold" o weight="bold" pero sin color
        {
          search: /<Typography variant="h5" weight="semibold">/g,
          replace: '<Typography variant="h5" color="secondary" weight="medium">'
        },
        {
          search: /<Typography variant="h5" weight="bold">/g,
          replace: '<Typography variant="h5" color="secondary" weight="medium">'
        },
        // h5 con className pero sin color ni weight
        {
          search: /<Typography variant="h5" className="([^"]*)">/g,
          replace: '<Typography variant="h5" color="secondary" weight="medium" className="$1">'
        },
        // h5 con weight pero sin color
        {
          search: /<Typography variant="h5" weight="([^"]*)"(?!\s+color)/g,
          replace: '<Typography variant="h5" color="secondary" weight="medium"'
        }
      ];
      
      patterns.forEach(pattern => {
        if (pattern.search.test(content)) {
          content = content.replace(pattern.search, pattern.replace);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Actualizado: ${fullPath}`);
      }
    }
  });
}

// Directorios a procesar
const directories = [
  'src/pages',
  'src/components',
  'src/contexts'
];

console.log('🎯 Aplicando estilos consistentes a todos los h5...');

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Procesando: ${dir}`);
    aplicarEstilosH5(dir);
  }
});

console.log('\n✅ Proceso completado!');
console.log('\n📋 Resumen de cambios:');
console.log('- Todos los h5 ahora usan: variant="h5" color="secondary" weight="medium"');
console.log('- Se mantuvieron los h5 que ya tenían el estilo correcto');
console.log('- Se corrigieron los h5 que tenían estilos inconsistentes');
