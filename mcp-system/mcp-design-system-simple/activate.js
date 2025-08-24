#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🎨 Activando MCP Design System Simple...'));

// Crear estructura de directorios
const dirs = [
  'mcp-system/mcp-design-system-simple/config',
  'mcp-system/mcp-design-system-simple/output',
  'mcp-system/mcp-design-system-simple/output/components',
  'mcp-system/mcp-design-system-simple/output/documentation'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`✅ Creado directorio: ${dir}`));
  }
});

// Crear configuración de tokens
const tokensConfig = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      900: '#111827'
    }
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem'
  }
};

fs.writeFileSync(
  'mcp-system/mcp-design-system-simple/config/tokens.json',
  JSON.stringify(tokensConfig, null, 2)
);

// Crear configuración de componentes
const componentsConfig = {
  existing: [
    'Button',
    'Input',
    'Select',
    'Modal',
    'Card',
    'DataTable',
    'Typography',
    'Badge',
    'Chip',
    'ProgressBar'
  ],
  patterns: [
    'Form',
    'Navigation',
    'Layout',
    'Sidebar',
    'Header',
    'Footer',
    'Dashboard',
    'List',
    'Grid',
    'Tabs'
  ]
};

fs.writeFileSync(
  'mcp-system/mcp-design-system-simple/config/components.json',
  JSON.stringify(componentsConfig, null, 2)
);

console.log(chalk.green('✅ Configuración creada'));

// Crear script de generación de componentes
const generateScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const componentName = process.argv[3] || 'NewComponent';

console.log(chalk.blue(\`🎨 Generando componente: \${componentName}\`));

// Verificar si el componente ya existe
const existingComponents = JSON.parse(
  fs.readFileSync('mcp-system/mcp-design-system-simple/config/components.json', 'utf8')
);

if (existingComponents.existing.includes(componentName)) {
  console.log(chalk.yellow(\`⚠️ El componente \${componentName} ya existe\`));
  process.exit(0);
}

// Generar componente
const componentCode = \`import React from 'react';

interface \${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

export const \${componentName}: React.FC<\${componentName}Props> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={\`\${className}\`}>
      {children}
    </div>
  );
};

export default \${componentName};
\`;

// Generar archivo de componente
const componentPath = \`mcp-system/mcp-design-system-simple/output/components/\${componentName}.tsx\`;
fs.writeFileSync(componentPath, componentCode);

// Generar documentación
const documentation = \`# \${componentName}

## Descripción
Componente \${componentName} generado automáticamente por MCP Design System.

## Props
- \`children\`: Contenido del componente
- \`className\`: Clases CSS adicionales

## Uso
\`\`\`tsx
import { \${componentName} } from './components/\${componentName}';

<\${componentName} className="custom-class">
  Contenido del componente
</\${componentName}>
\`\`\`

## Generado
Fecha: \${new Date().toISOString()}
MCP: Design System Simple
\`;

const docPath = \`mcp-system/mcp-design-system-simple/output/documentation/\${componentName}.md\`;
fs.writeFileSync(docPath, documentation);

// Actualizar configuración
existingComponents.existing.push(componentName);
fs.writeFileSync(
  'mcp-system/mcp-design-system-simple/config/components.json',
  JSON.stringify(existingComponents, null, 2)
);

console.log(chalk.green(\`✅ Componente \${componentName} generado\`));
console.log(chalk.cyan(\`📁 Archivo: \${componentPath}\`));
console.log(chalk.cyan(\`📄 Documentación: \${docPath}\`));
`;

fs.writeFileSync(
  'mcp-system/mcp-design-system-simple/generate-component.js',
  generateScript
);

// Crear script de validación
const validateScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🔍 Validando componentes existentes...'));

// Leer configuración
const config = JSON.parse(
  fs.readFileSync('mcp-system/mcp-design-system-simple/config/components.json', 'utf8')
);

console.log(chalk.green('✅ Componentes existentes:'));
config.existing.forEach(component => {
  console.log(chalk.cyan(\`  - \${component}\`));
});

console.log(chalk.green('\\n✅ Patrones disponibles:'));
config.patterns.forEach(pattern => {
  console.log(chalk.cyan(\`  - \${pattern}\`));
});

// Verificar archivos generados
const outputDir = 'mcp-system/mcp-design-system-simple/output/components';
if (fs.existsSync(outputDir)) {
  const files = fs.readdirSync(outputDir);
  console.log(chalk.green('\\n✅ Componentes generados:'));
  files.forEach(file => {
    console.log(chalk.cyan(\`  - \${file}\`));
  });
}

console.log(chalk.green('\\n✅ Validación completada'));
`;

fs.writeFileSync(
  'mcp-system/mcp-design-system-simple/validate-components.js',
  validateScript
);

console.log(chalk.green('✅ Scripts creados'));
console.log(chalk.blue('\\n📋 COMANDOS DISPONIBLES:'));
console.log(chalk.yellow('  - Generar componente: node mcp-system/mcp-design-system-simple/generate-component.js --name NombreComponente'));
console.log(chalk.yellow('  - Validar componentes: node mcp-system/mcp-design-system-simple/validate-components.js'));

console.log(chalk.green('\\n🚀 MCP Design System Simple activado exitosamente!'));
