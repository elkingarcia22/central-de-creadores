#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🤖 Auto-commit hook ejecutándose...');

try {
  // Verificar si hay cambios para commitear
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (status.trim()) {
    console.log('📝 Cambios detectados, ejecutando auto-commit...');
    
    // Agregar todos los cambios
    execSync('git add .', { stdio: 'inherit' });
    
    // Crear mensaje de commit
    const timestamp = new Date().toISOString();
    const commitMessage = `🤖 Auto-commit: ${timestamp}`;
    
    // Hacer commit
    execSync(`git commit -m "${commitMessage}" --no-verify`, { stdio: 'inherit' });
    
    // Push automático
    try {
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Auto-commit completado y enviado a GitHub');
    } catch (pushError) {
      console.log('⚠️ Auto-commit completado, pero push falló (normal en desarrollo)');
    }
  } else {
    console.log('✅ No hay cambios para commitear');
  }
  
} catch (error) {
  console.log('❌ Error en auto-commit:', error.message);
  // No fallar el commit por errores en el hook
  process.exit(0);
}
