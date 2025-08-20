import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

/**
 * MCP SYNC MANAGER - Gestor de Sincronización de MCPs
 * 
 * Responsabilidades:
 * - Sincronizar información de otros MCPs automáticamente
 * - Mantener estado actualizado de Supabase, Design System, etc.
 * - Proporcionar información en tiempo real de todos los MCPs
 * - Detectar cambios y actualizar contexto automáticamente
 */
export class MCPSyncManager {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.projectRoot = path.join(baseDir, '..', '..');
    this.syncData = new Map();
    this.lastSync = new Map();
    this.syncInterval = null;
    this.isAutoSyncEnabled = true;
    
    this.initializeSyncData();
  }

  /**
   * Inicializar datos de sincronización
   */
  initializeSyncData() {
    // Configurar datos de sincronización para cada MCP
    this.syncData.set('supabase', {
      name: 'Supabase',
      status: 'unknown',
      lastSync: null,
      data: {},
      capabilities: ['database', 'auth', 'realtime', 'storage'],
      syncMethods: ['schema', 'tables', 'functions', 'policies', 'data']
    });

    this.syncData.set('design-system', {
      name: 'Design System',
      status: 'unknown',
      lastSync: null,
      data: {},
      capabilities: ['components', 'tokens', 'themes', 'icons'],
      syncMethods: ['components', 'tokens', 'themes', 'icons']
    });

    this.syncData.set('code-structure', {
      name: 'Code Structure',
      status: 'unknown',
      lastSync: null,
      data: {},
      capabilities: ['refactoring', 'organization', 'optimization'],
      syncMethods: ['structure', 'imports', 'dependencies']
    });

    this.syncData.set('testing-qa', {
      name: 'Testing QA',
      status: 'unknown',
      lastSync: null,
      data: {},
      capabilities: ['testing', 'debugging', 'validation'],
      syncMethods: ['tests', 'coverage', 'issues']
    });
  }

  /**
   * Iniciar sincronización automática
   */
  async startAutoSync(intervalMinutes = 5) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    console.log(`🔄 Iniciando sincronización automática cada ${intervalMinutes} minutos`);

    // Sincronización inicial
    await this.syncAllMCPs();

    // Configurar sincronización periódica
    this.syncInterval = setInterval(async () => {
      await this.syncAllMCPs();
    }, intervalMinutes * 60 * 1000);

    return {
      success: true,
      message: `Sincronización automática iniciada cada ${intervalMinutes} minutos`,
      nextSync: new Date(Date.now() + intervalMinutes * 60 * 1000)
    };
  }

  /**
   * Detener sincronización automática
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Sincronización automática detenida');
    }
    return { success: true, message: 'Sincronización automática detenida' };
  }

  /**
   * Sincronizar todos los MCPs
   */
  async syncAllMCPs() {
    console.log('🔄 Sincronizando todos los MCPs...');
    
    const results = {};
    const promises = [];

    // Sincronizar cada MCP en paralelo
    for (const [mcpName, mcpData] of this.syncData) {
      promises.push(this.syncMCP(mcpName).then(result => {
        results[mcpName] = result;
      }));
    }

    await Promise.allSettled(promises);

    // Guardar estado de sincronización
    await this.saveSyncState(results);

    console.log('✅ Sincronización completada');
    return results;
  }

  /**
   * Sincronizar MCP específico
   */
  async syncMCP(mcpName) {
    try {
      console.log(`🔄 Sincronizando ${mcpName}...`);
      
      const mcpData = this.syncData.get(mcpName);
      if (!mcpData) {
        throw new Error(`MCP ${mcpName} no encontrado`);
      }

      let syncResult;

      switch (mcpName) {
        case 'supabase':
          syncResult = await this.syncSupabase();
          break;
        case 'design-system':
          syncResult = await this.syncDesignSystem();
          break;
        case 'code-structure':
          syncResult = await this.syncCodeStructure();
          break;
        case 'testing-qa':
          syncResult = await this.syncTestingQA();
          break;
        default:
          throw new Error(`Método de sincronización no implementado para ${mcpName}`);
      }

      // Actualizar estado del MCP
      mcpData.status = 'synced';
      mcpData.lastSync = new Date().toISOString();
      mcpData.data = syncResult;

      return {
        success: true,
        mcp: mcpName,
        data: syncResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Error sincronizando ${mcpName}:`, error);
      
      const mcpData = this.syncData.get(mcpName);
      if (mcpData) {
        mcpData.status = 'error';
        mcpData.lastSync = new Date().toISOString();
        mcpData.error = error.message;
      }

      return {
        success: false,
        mcp: mcpName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Sincronizar información de Supabase
   */
  async syncSupabase() {
    const supabaseData = {
      connection: await this.checkSupabaseConnection(),
      schema: await this.getSupabaseSchema(),
      tables: await this.getSupabaseTables(),
      functions: await this.getSupabaseFunctions(),
      policies: await this.getSupabasePolicies(),
      data: await this.getSupabaseData(),
      migrations: await this.getSupabaseMigrations()
    };

    return supabaseData;
  }

  /**
   * Verificar conexión con Supabase
   */
  async checkSupabaseConnection() {
    try {
      // Verificar archivo de configuración
      const supabaseConfigPath = path.join(this.projectRoot, 'src', 'api', 'supabase.ts');
      const configExists = await fs.access(supabaseConfigPath).then(() => true).catch(() => false);

      // Verificar variables de entorno
      const envPath = path.join(this.projectRoot, '.env.local');
      let envExists = false;
      let hasSupabaseVars = false;

      try {
        const envContent = await fs.readFile(envPath, 'utf8');
        envExists = true;
        hasSupabaseVars = envContent.includes('SUPABASE_URL') && envContent.includes('SUPABASE_ANON_KEY');
      } catch {
        envExists = false;
      }

      return {
        config_file_exists: configExists,
        env_file_exists: envExists,
        has_supabase_vars: hasSupabaseVars,
        connected: configExists && envExists && hasSupabaseVars
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener esquema de Supabase
   */
  async getSupabaseSchema() {
    try {
      // Buscar archivos SQL que definan el esquema
      const sqlFiles = await this.findSQLFiles();
      const schemaFiles = sqlFiles.filter(file => 
        file.name.includes('schema') || 
        file.name.includes('create') || 
        file.name.includes('table')
      );

      return {
        sql_files: schemaFiles.length,
        schema_files: schemaFiles.map(f => f.name),
        total_files: sqlFiles.length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener tablas de Supabase
   */
  async getSupabaseTables() {
    try {
      // Buscar archivos SQL que creen tablas
      const sqlFiles = await this.findSQLFiles();
      const tableFiles = sqlFiles.filter(file => 
        file.name.includes('table') || 
        file.name.includes('create')
      );

      // Extraer nombres de tablas de los archivos
      const tables = [];
      for (const file of tableFiles.slice(0, 10)) { // Limitar a 10 archivos
        try {
          const content = await fs.readFile(path.join(this.projectRoot, file.path), 'utf8');
          const tableMatches = content.match(/CREATE TABLE\s+(\w+)/gi);
          if (tableMatches) {
            tables.push(...tableMatches.map(match => match.replace('CREATE TABLE', '').trim()));
          }
        } catch {
          // Ignorar archivos que no se pueden leer
        }
      }

      return {
        total_tables: tables.length,
        tables: tables.slice(0, 20), // Limitar a 20 tablas
        table_files: tableFiles.length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener funciones de Supabase
   */
  async getSupabaseFunctions() {
    try {
      const sqlFiles = await this.findSQLFiles();
      const functionFiles = sqlFiles.filter(file => 
        file.name.includes('function') || 
        file.name.includes('rpc')
      );

      return {
        total_functions: functionFiles.length,
        function_files: functionFiles.map(f => f.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener políticas de Supabase
   */
  async getSupabasePolicies() {
    try {
      const sqlFiles = await this.findSQLFiles();
      const policyFiles = sqlFiles.filter(file => 
        file.name.includes('policy') || 
        file.name.includes('rls')
      );

      return {
        total_policies: policyFiles.length,
        policy_files: policyFiles.map(f => f.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener datos de Supabase
   */
  async getSupabaseData() {
    try {
      // Buscar archivos que contengan datos de ejemplo o seed
      const sqlFiles = await this.findSQLFiles();
      const dataFiles = sqlFiles.filter(file => 
        file.name.includes('data') || 
        file.name.includes('seed') || 
        file.name.includes('insert')
      );

      return {
        total_data_files: dataFiles.length,
        data_files: dataFiles.map(f => f.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener migraciones de Supabase
   */
  async getSupabaseMigrations() {
    try {
      const sqlFiles = await this.findSQLFiles();
      const migrationFiles = sqlFiles.filter(file => 
        file.name.includes('migration') || 
        file.name.includes('update') ||
        file.name.includes('alter')
      );

      return {
        total_migrations: migrationFiles.length,
        migration_files: migrationFiles.map(f => f.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Sincronizar Design System
   */
  async syncDesignSystem() {
    try {
      const designSystemPath = path.join(this.projectRoot, 'src', 'components');
      const designSystemData = {
        components: await this.getDesignSystemComponents(),
        tokens: await this.getDesignSystemTokens(),
        themes: await this.getDesignSystemThemes(),
        icons: await this.getDesignSystemIcons()
      };

      return designSystemData;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener componentes del Design System
   */
  async getDesignSystemComponents() {
    try {
      const componentsPath = path.join(this.projectRoot, 'src', 'components');
      const components = await this.scanDirectory(componentsPath, 3);
      
      const reactComponents = components.files.filter(file => 
        file.extension === '.tsx' || file.extension === '.jsx'
      );

      return {
        total_components: reactComponents.length,
        components: reactComponents.map(c => c.name),
        directories: components.directories.map(d => d.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener tokens del Design System
   */
  async getDesignSystemTokens() {
    try {
      const tokensPath = path.join(this.projectRoot, 'src', 'design-system', 'tokens');
      const tokens = await this.scanDirectory(tokensPath, 2);
      
      const tokenFiles = tokens.files.filter(file => 
        file.extension === '.json' || file.extension === '.css'
      );

      return {
        total_tokens: tokenFiles.length,
        token_files: tokenFiles.map(f => f.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener temas del Design System
   */
  async getDesignSystemThemes() {
    try {
      const themesPath = path.join(this.projectRoot, 'src', 'design-system', 'themes');
      const themes = await this.scanDirectory(themesPath, 2);
      
      return {
        total_themes: themes.files.length,
        theme_files: themes.files.map(f => f.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener iconos del Design System
   */
  async getDesignSystemIcons() {
    try {
      const iconsPath = path.join(this.projectRoot, 'src', 'components', 'icons');
      const icons = await this.scanDirectory(iconsPath, 2);
      
      return {
        total_icons: icons.files.length,
        icon_files: icons.files.map(f => f.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Sincronizar Code Structure
   */
  async syncCodeStructure() {
    try {
      const codeStructureData = {
        structure: await this.getCodeStructure(),
        imports: await this.getCodeImports(),
        dependencies: await this.getCodeDependencies()
      };

      return codeStructureData;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener estructura del código
   */
  async getCodeStructure() {
    try {
      const srcPath = path.join(this.projectRoot, 'src');
      const structure = await this.scanDirectory(srcPath, 4);
      
      return {
        total_files: structure.files.length,
        total_directories: structure.directories.length,
        file_types: this.groupByExtension(structure.files),
        directories: structure.directories.map(d => d.name)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener imports del código
   */
  async getCodeImports() {
    try {
      const srcPath = path.join(this.projectRoot, 'src');
      const files = await this.scanDirectory(srcPath, 3);
      
      const tsFiles = files.files.filter(f => 
        f.extension === '.ts' || f.extension === '.tsx'
      );

      // Analizar algunos archivos para obtener imports
      const imports = new Set();
      for (const file of tsFiles.slice(0, 10)) {
        try {
          const content = await fs.readFile(path.join(this.projectRoot, file.path), 'utf8');
          const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
          if (importMatches) {
            importMatches.forEach(match => {
              const module = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
              if (module) imports.add(module);
            });
          }
        } catch {
          // Ignorar archivos que no se pueden leer
        }
      }

      return {
        total_imports: imports.size,
        unique_modules: Array.from(imports).slice(0, 20)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener dependencias del código
   */
  async getCodeDependencies() {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      return {
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        total_dependencies: Object.keys(packageJson.dependencies || {}).length + 
                           Object.keys(packageJson.devDependencies || {}).length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Sincronizar Testing QA
   */
  async syncTestingQA() {
    try {
      const testingData = {
        tests: await this.getTests(),
        coverage: await this.getCoverage(),
        issues: await this.getIssues()
      };

      return testingData;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener tests
   */
  async getTests() {
    try {
      const testFiles = await this.findTestFiles();
      
      return {
        total_tests: testFiles.length,
        test_files: testFiles.map(f => f.name),
        test_types: this.groupByExtension(testFiles)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener cobertura
   */
  async getCoverage() {
    try {
      const coveragePath = path.join(this.projectRoot, 'coverage');
      const coverageExists = await fs.access(coveragePath).then(() => true).catch(() => false);
      
      return {
        coverage_exists: coverageExists,
        coverage_path: coveragePath
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtener issues
   */
  async getIssues() {
    try {
      // Buscar archivos de configuración de linting
      const eslintPath = path.join(this.projectRoot, '.eslintrc.json');
      const eslintExists = await fs.access(eslintPath).then(() => true).catch(() => false);
      
      return {
        eslint_configured: eslintExists,
        linting_enabled: eslintExists
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Métodos auxiliares
   */
  async findSQLFiles() {
    try {
      const sqlFiles = [];
      const scanResult = await this.scanDirectory(this.projectRoot, 3);
      
      for (const file of scanResult.files) {
        if (file.extension === '.sql') {
          sqlFiles.push(file);
        }
      }
      
      return sqlFiles;
    } catch (error) {
      return [];
    }
  }

  async findTestFiles() {
    try {
      const testFiles = [];
      const scanResult = await this.scanDirectory(this.projectRoot, 3);
      
      for (const file of scanResult.files) {
        if (file.name.includes('.test.') || file.name.includes('.spec.')) {
          testFiles.push(file);
        }
      }
      
      return testFiles;
    } catch (error) {
      return [];
    }
  }

  async scanDirectory(dirPath, maxDepth = 3, currentDepth = 0) {
    if (currentDepth > maxDepth) return { directories: [], files: [] };

    try {
      const items = await fs.readdir(dirPath);
      const directories = [];
      const files = [];

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          directories.push({
            name: item,
            path: path.relative(this.projectRoot, fullPath),
            depth: currentDepth
          });

          if (currentDepth < maxDepth) {
            const subResult = await this.scanDirectory(fullPath, maxDepth, currentDepth + 1);
            directories.push(...subResult.directories);
            files.push(...subResult.files);
          }
        } else {
          files.push({
            name: item,
            path: path.relative(this.projectRoot, fullPath),
            size: stat.size,
            extension: path.extname(item)
          });
        }
      }

      return { directories, files };
    } catch (error) {
      return { directories: [], files: [] };
    }
  }

  groupByExtension(files) {
    const groups = {};
    files.forEach(file => {
      const ext = file.extension || 'no-extension';
      groups[ext] = (groups[ext] || 0) + 1;
    });
    return groups;
  }

  async saveSyncState(results) {
    try {
      const syncStatePath = path.join(this.baseDir, 'storage', 'mcp-sync-state.json');
      const syncState = {
        last_sync: new Date().toISOString(),
        results,
        summary: this.generateSyncSummary(results)
      };
      
      await fs.writeFile(syncStatePath, JSON.stringify(syncState, null, 2));
    } catch (error) {
      console.error('Error guardando estado de sincronización:', error);
    }
  }

  generateSyncSummary(results) {
    const summary = {
      total_mcps: Object.keys(results).length,
      successful_syncs: 0,
      failed_syncs: 0,
      mcp_status: {}
    };

    for (const [mcpName, result] of Object.entries(results)) {
      if (result.success) {
        summary.successful_syncs++;
        summary.mcp_status[mcpName] = 'synced';
      } else {
        summary.failed_syncs++;
        summary.mcp_status[mcpName] = 'error';
      }
    }

    return summary;
  }

  /**
   * Obtener estado de sincronización
   */
  getSyncStatus() {
    const status = {};
    for (const [mcpName, mcpData] of this.syncData) {
      status[mcpName] = {
        name: mcpData.name,
        status: mcpData.status,
        lastSync: mcpData.lastSync,
        capabilities: mcpData.capabilities
      };
    }
    return status;
  }

  /**
   * Obtener datos sincronizados de un MCP específico
   */
  getMCPData(mcpName) {
    const mcpData = this.syncData.get(mcpName);
    return mcpData ? mcpData.data : null;
  }
}
