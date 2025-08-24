#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const componentName = process.argv[3] || 'NewComponent';

console.log(chalk.blue(`🎨 Generando componente: ${componentName}`));

// Verificar si el componente ya existe
const existingComponents = JSON.parse(
  fs.readFileSync('mcp-system/mcp-design-system-simple/config/components.json', 'utf8')
);

if (existingComponents.existing.includes(componentName)) {
  console.log(chalk.yellow(`⚠️ El componente ${componentName} ya existe`));
  process.exit(0);
}

// Generar componente
const componentCode = `import React from 'react';

interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default ${componentName};
`;

// Generar archivo de componente
const componentPath = `mcp-system/mcp-design-system-simple/output/components/${componentName}.tsx`;
fs.writeFileSync(componentPath, componentCode);

// Generar documentación
const documentation = `# ${componentName}

## Descripción
Componente ${componentName} generado automáticamente por MCP Design System.

## Props
- children: Contenido del componente
- className: Clases CSS adicionales

## Uso
\`\`\`tsx
import { ${componentName} } from './components/${componentName}';

<${componentName} className="custom-class">
  Contenido del componente
</${componentName}>
\`\`\`

## Generado
Fecha: ${new Date().toISOString()}
MCP: Design System Simple
`;

const docPath = `mcp-system/mcp-design-system-simple/output/documentation/${componentName}.md`;
fs.writeFileSync(docPath, documentation);

// Actualizar configuración
existingComponents.existing.push(componentName);
fs.writeFileSync(
  'mcp-system/mcp-design-system-simple/config/components.json',
  JSON.stringify(existingComponents, null, 2)
);

console.log(chalk.green(`✅ Componente ${componentName} generado`));
console.log(chalk.cyan(`📁 Archivo: ${componentPath}`));
console.log(chalk.cyan(`📄 Documentación: ${docPath}`));
