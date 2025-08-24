#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🎨 Quitando sombras de contenedores para una apariencia más limpia...'));

// Función para procesar archivos
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Quitar sombras de CSS
    const shadowPatterns = [
      // Box shadows
      { 
        pattern: /box-shadow:\s*0\s+\d+px\s+\d+px\s+rgba\([^)]+\)/g, 
        replacement: 'border: 1px solid #F1F5F9' 
      },
      { 
        pattern: /box-shadow:\s*0\s+\d+px\s+\d+px\s+-\d+px\s+rgba\([^)]+\)/g, 
        replacement: 'border: 1px solid #F1F5F9' 
      },
      // Shadow classes
      { 
        pattern: /shadow-md/g, 
        replacement: '' 
      },
      { 
        pattern: /shadow-lg/g, 
        replacement: '' 
      },
      { 
        pattern: /shadow-xl/g, 
        replacement: '' 
      },
      { 
        pattern: /shadow-sm/g, 
        replacement: '' 
      },
      // Hover shadows
      { 
        pattern: /hover:shadow-lg/g, 
        replacement: 'hover:border-slate-200' 
      },
      { 
        pattern: /hover:shadow-md/g, 
        replacement: 'hover:border-slate-200' 
      },
      // Transition shadows
      { 
        pattern: /transition-shadow/g, 
        replacement: 'transition-colors' 
      },
      // Border colors más sutiles
      { 
        pattern: /border-slate-200/g, 
        replacement: 'border-slate-100' 
      },
      { 
        pattern: /border-slate-700/g, 
        replacement: 'border-slate-800' 
      }
    ];

    shadowPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(chalk.green(`✅ Procesado: ${filePath}`));
      return true;
    }
    return false;
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Error procesando ${filePath}: ${error.message}`));
    return false;
  }
}

// Función para buscar archivos recursivamente
function findFiles(dir, extensions = ['.css', '.tsx', '.ts', '.js']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Procesar archivos
const srcDir = path.join(process.cwd(), 'src');
const publicDir = path.join(process.cwd(), 'public');

console.log(chalk.blue('🔍 Buscando archivos con sombras...'));

const srcFiles = findFiles(srcDir);
const publicFiles = findFiles(publicDir);

const allFiles = [...srcFiles, ...publicFiles];
let processedCount = 0;

allFiles.forEach(file => {
  if (processFile(file)) {
    processedCount++;
  }
});

console.log(chalk.green(`\n✅ Proceso completado!`));
console.log(chalk.cyan(`📊 Archivos procesados: ${processedCount}`));
console.log(chalk.blue(`🎨 Sombras removidas para una apariencia más limpia`));
console.log(chalk.yellow(`💡 Las líneas ahora son más sutiles con colores más claros`));
