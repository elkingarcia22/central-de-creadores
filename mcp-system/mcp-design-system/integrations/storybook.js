import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export class StorybookIntegrator {
  constructor(configPath) {
    this.config = null;
    this.configPath = configPath;
  }

  async init() {
    const configFile = await fs.readFile(this.configPath, 'utf8');
    this.config = JSON.parse(configFile);
  }

  async installStorybook(version = 'latest') {
    console.log(`📚 Instalando Storybook versión ${version}...`);

    try {
      // Instalar dependencias principales
      execSync('npm install --save-dev @storybook/nextjs @storybook/react @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-styling @storybook/addon-themes @storybook/blocks @storybook/testing-library');

      // Instalar dependencias adicionales
      execSync('npm install --save-dev @babel/preset-env @babel/preset-react @babel/preset-typescript');

      // Crear estructura de directorios
      await this.createStorybookStructure();

      // Configurar Storybook
      await this.configureStorybook();

      return {
        success: true,
        version,
        message: 'Storybook instalado y configurado correctamente'
      };
    } catch (error) {
      console.error('Error instalando Storybook:', error);
      throw error;
    }
  }

  async createStorybookStructure() {
    const directories = [
      '.storybook',
      'src/stories',
      'src/stories/components',
      'src/stories/foundations',
      'src/stories/patterns'
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async configureStorybook() {
    // Crear main.js
    const mainConfig = `
      import path from 'path';
      
      const config = {
        stories: ${JSON.stringify(this.config.stories)},
        addons: ${JSON.stringify(this.config.addons)},
        framework: ${JSON.stringify(this.config.framework)},
        staticDirs: ${JSON.stringify(this.config.staticDirs)},
        features: ${JSON.stringify(this.config.features)},
        docs: ${JSON.stringify(this.config.docs)},
        typescript: ${JSON.stringify(this.config.typescript)},
        core: ${JSON.stringify(this.config.core)},
        webpackFinal: async (config) => {
          config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, '../src'),
          };
          return config;
        },
      };
      
      export default config;
    `;

    // Crear preview.js
    const previewConfig = `
      import '../src/styles/globals.css';
      import { withThemeByClassName } from '@storybook/addon-themes';
      
      export const decorators = [
        withThemeByClassName({
          themes: {
            light: '',
            dark: 'dark',
          },
          defaultTheme: 'light',
        }),
      ];
      
      export const parameters = {
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
          matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
          },
        },
        docs: {
          theme: ${JSON.stringify(this.config.theme)},
        },
      };
    `;

    await fs.writeFile('.storybook/main.js', mainConfig);
    await fs.writeFile('.storybook/preview.js', previewConfig);
  }

  async generateStory(component) {
    const { name, code } = component;
    
    const storyTemplate = `
      import React from 'react';
      import { Story, Meta } from '@storybook/react';
      import { ${name} } from '@/components/${name}';
      
      export default {
        title: 'Components/${name}',
        component: ${name},
        parameters: {
          layout: 'centered',
        },
      } as Meta;
      
      const Template: Story = (args) => <${name} {...args} />;
      
      export const Default = Template.bind({});
      Default.args = {};
      
      export const WithVariants = Template.bind({});
      WithVariants.args = {
        variant: 'primary',
      };
    `;

    const storyPath = `src/stories/components/${name}.stories.tsx`;
    await fs.writeFile(storyPath, storyTemplate);

    return {
      success: true,
      path: storyPath,
      message: `Story generado para ${name}`
    };
  }

  async generateStoriesForAllComponents() {
    const componentsDir = 'src/components';
    const files = await fs.readdir(componentsDir);

    const results = [];
    for (const file of files) {
      if (file.endsWith('.tsx') && !file.endsWith('.stories.tsx')) {
        const componentName = path.basename(file, '.tsx');
        const component = {
          name: componentName,
          code: await fs.readFile(`${componentsDir}/${file}`, 'utf8')
        };

        try {
          const result = await this.generateStory(component);
          results.push(result);
        } catch (error) {
          console.error(`Error generando story para ${componentName}:`, error);
          results.push({
            success: false,
            component: componentName,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  async updateStories(components) {
    const results = [];
    for (const component of components) {
      try {
        const storyPath = `src/stories/components/${component.name}.stories.tsx`;
        if (await this.fileExists(storyPath)) {
          const result = await this.updateStory(component);
          results.push(result);
        }
      } catch (error) {
        console.error(`Error actualizando story para ${component.name}:`, error);
        results.push({
          success: false,
          component: component.name,
          error: error.message
        });
      }
    }

    return results;
  }

  async updateStory(component) {
    // Implementar lógica de actualización de story
    return {
      success: true,
      component: component.name,
      message: `Story actualizado para ${component.name}`
    };
  }

  async fileExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

export default StorybookIntegrator;
