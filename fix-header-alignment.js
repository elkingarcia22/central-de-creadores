const fs = require('fs');

// Configuración de iconos y colores por página
const pageConfigs = {
  'src/pages/investigaciones.tsx': {
    icon: 'InvestigacionesIcon',
    bgLight: 'bg-blue-50',
    bgDark: 'bg-blue-900 bg-opacity-20',
    iconColor: 'text-blue-600',
    title: 'Investigaciones',
    subtitle: 'Gestionar estudios y proyectos de investigación'
  },
  'src/pages/participantes.tsx': {
    icon: 'UserIcon',
    bgLight: 'bg-purple-50',
    bgDark: 'bg-purple-900 bg-opacity-20',
    iconColor: 'text-purple-600',
    title: 'Participantes',
    subtitle: 'Gestionar participantes de investigaciones'
  },
  'src/pages/empresas.tsx': {
    icon: 'EmpresasIcon',
    bgLight: 'bg-green-50',
    bgDark: 'bg-green-900 bg-opacity-20',
    iconColor: 'text-green-600',
    title: 'Empresas',
    subtitle: 'Gestionar empresas cliente'
  },
  'src/pages/sesiones.tsx': {
    icon: 'SesionesIcon',
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-900 bg-opacity-20',
    iconColor: 'text-orange-600',
    title: 'Sesiones',
    subtitle: 'Gestionar sesiones de investigación'
  },
  'src/pages/reclutamiento.tsx': {
    icon: 'ReclutamientoIcon',
    bgLight: 'bg-teal-50',
    bgDark: 'bg-teal-900 bg-opacity-20',
    iconColor: 'text-teal-600',
    title: 'Reclutamiento',
    subtitle: 'Gestionar proceso de reclutamiento'
  },
  'src/pages/metricas.tsx': {
    icon: 'MetricasIcon',
    bgLight: 'bg-red-50',
    bgDark: 'bg-red-900 bg-opacity-20',
    iconColor: 'text-red-600',
    title: 'Métricas',
    subtitle: 'Análisis y métricas de investigación'
  },
  'src/pages/configuraciones.tsx': {
    icon: 'ConfiguracionesIcon',
    bgLight: 'bg-gray-50',
    bgDark: 'bg-gray-900 bg-opacity-20',
    iconColor: 'text-gray-600',
    title: 'Configuraciones',
    subtitle: 'Configuraciones del sistema'
  }
};

function generateHeaderTemplate(config) {
  return `          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className={\`p-3 rounded-lg \${theme === 'dark' ? '${config.bgDark}' : '${config.bgLight}'}\`}>
                <${config.icon} className="w-8 h-8 ${config.iconColor}" />
              </div>
              <div>
                <Typography variant="h1" color="title" weight="bold">
                  ${config.title}
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  ${config.subtitle}
                </Typography>
              </div>
            </div>
          </div>`;
}

function fixHeaderAlignment(filePath, config) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar y reemplazar el header existente
    const headerRegex = /\s*{\/\* Header \*\/}[\s\S]*?<\/div>\s*<\/div>/;
    
    const newHeader = generateHeaderTemplate(config);
    const updatedContent = content.replace(headerRegex, '\n' + newHeader + '\n');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Corregido header en: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Sin cambios en: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Procesar cada archivo
let totalFixed = 0;
Object.entries(pageConfigs).forEach(([filePath, config]) => {
  if (fixHeaderAlignment(filePath, config)) {
    totalFixed++;
  }
});

console.log(`\n✅ Proceso completado - Se corrigieron ${totalFixed} headers de iconos`); 