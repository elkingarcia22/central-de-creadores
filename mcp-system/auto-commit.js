#!/usr/bin/env node

/**
 * Auto-commit script para MCP Maestro
 * Gestiona automáticamente los commits con el sistema MCP
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🎯 MCP Maestro: Procesando auto-commit...');

try {
  // Verificar si hay cambios para commitear
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (!status.trim()) {
    console.log('✅ No hay cambios para commitear');
    process.exit(0);
  }

  // Verificar si el MCP Maestro está activo
  const mcpMaestroPath = path.join(process.cwd(), 'mcp-system', 'mcp-maestro');
  if (fs.existsSync(mcpMaestroPath)) {
    console.log('🔗 MCP Maestro detectado, sincronizando estado...');
    
    // Actualizar estado de sincronización
    const syncStatePath = path.join(mcpMaestroPath, 'storage', 'mcp-sync-state.json');
    if (fs.existsSync(syncStatePath)) {
      const syncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf8'));
      syncState.last_commit = new Date().toISOString();
      syncState.commit_count = (syncState.commit_count || 0) + 1;
      fs.writeFileSync(syncStatePath, JSON.stringify(syncState, null, 2));
    }
  }

  console.log('✅ Auto-commit procesado exitosamente');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Error en auto-commit:', error.message);
  // No fallar el commit por errores en el script
  process.exit(0);
}
