const fs = require('fs');
const path = require('path');

class TokenApplier {
  constructor() {
    this.backupDir = path.join(__dirname, '../../../backups/tokens');
    this.componentsDir = path.join(__dirname, '../../../src/components');
  }

  // Crear backup antes de aplicar cambios
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `tokens-backup-${timestamp}`);
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Backup de archivos CSS principales
    const filesToBackup = [
      '../../../src/styles/globals.css',
      '../../../tailwind.config.js'
    ];

    filesToBackup.forEach(file => {
      const sourcePath = path.join(__dirname, file);
      if (fs.existsSync(sourcePath)) {
        const fileName = path.basename(file);
        const backupFilePath = path.join(backupPath, fileName);
        fs.mkdirSync(path.dirname(backupFilePath), { recursive: true });
        fs.copyFileSync(sourcePath, backupFilePath);
        console.log(`✅ Backup creado: ${fileName}`);
      }
    });

    console.log(`📦 Backup completo guardado en: ${backupPath}`);
    return backupPath;
  }

  // Verificar que el servidor funcione
  async checkServerHealth() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      // Verificar si el servidor está corriendo
      const { stdout } = await execAsync('curl -s http://localhost:3000 > /dev/null && echo "OK" || echo "ERROR"');
      
      if (stdout.trim() === 'OK') {
        console.log('✅ Servidor funcionando correctamente');
        return true;
      } else {
        console.log('❌ Servidor no responde');
        return false;
      }
    } catch (error) {
      console.log('❌ Error verificando servidor:', error.message);
      return false;
    }
  }

  // Aplicar tokens de forma segura
  async applyTokens() {
    console.log('🔄 Iniciando aplicación segura de tokens...\n');

    // 1. Crear backup
    console.log('📦 Creando backup...');
    const backupPath = this.createBackup();

    // 2. Verificar servidor antes
    console.log('🔍 Verificando estado del servidor...');
    const serverBefore = await this.checkServerHealth();

    // 3. Aplicar cambios
    console.log('🎨 Aplicando sistema de tokens...');
    
    // Importar el archivo de design tokens en globals.css
    const globalsPath = path.join(__dirname, '../../../src/styles/globals.css');
    let globalsContent = fs.readFileSync(globalsPath, 'utf8');
    
    // Agregar import del archivo de tokens si no existe
    if (!globalsContent.includes('design-tokens.css')) {
      const importStatement = '@import "./design-tokens.css";\n\n';
      globalsContent = importStatement + globalsContent;
      fs.writeFileSync(globalsPath, globalsContent);
      console.log('✅ Import de design tokens agregado a globals.css');
    }

    // 4. Verificar servidor después
    console.log('🔍 Verificando servidor después de cambios...');
    const serverAfter = await this.checkServerHealth();

    // 5. Reporte final
    console.log('\n📊 REPORTE FINAL:');
    console.log(`📦 Backup: ${backupPath}`);
    console.log(`🔍 Servidor antes: ${serverBefore ? '✅ OK' : '❌ ERROR'}`);
    console.log(`🔍 Servidor después: ${serverAfter ? '✅ OK' : '❌ ERROR'}`);
    
    if (serverAfter) {
      console.log('\n🎉 ¡Aplicación exitosa! El sistema de tokens está activo.');
    } else {
      console.log('\n⚠️  Advertencia: El servidor no responde después de los cambios.');
      console.log('💡 Revisa los logs del servidor para más detalles.');
    }

    return {
      backupPath,
      serverBefore,
      serverAfter,
      success: serverAfter
    };
  }

  // Restaurar desde backup
  restoreFromBackup(backupPath) {
    console.log(`🔄 Restaurando desde backup: ${backupPath}`);
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Backup no encontrado');
      return false;
    }

    const filesToRestore = [
      'globals.css',
      'tailwind.config.js'
    ];

    filesToRestore.forEach(file => {
      const backupFile = path.join(backupPath, file);
      const targetFile = path.join(__dirname, `../../../src/styles/${file}`);
      
      if (fs.existsSync(backupFile)) {
        fs.copyFileSync(backupFile, targetFile);
        console.log(`✅ Restaurado: ${file}`);
      }
    });

    console.log('✅ Restauración completada');
    return true;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const applier = new TokenApplier();
  applier.applyTokens().catch(console.error);
}

module.exports = TokenApplier;
