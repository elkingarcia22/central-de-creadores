import fs from 'fs/promises';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export class ComponentGenerator {
  constructor(configPath) {
    this.config = null;
    this.configPath = configPath;
  }

  async init() {
    const configFile = await fs.readFile(this.configPath, 'utf8');
    this.config = JSON.parse(configFile);
  }

  async generateVariants(component) {
    const { name, code } = component;
    const componentConfig = this.config.component_variants[name];

    if (!componentConfig) {
      throw new Error(`No hay configuración de variantes para el componente ${name}`);
    }

    const variants = [];
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    // Generar variantes para cada tipo configurado
    for (const type of componentConfig.types) {
      const typeConfig = this.config.variant_types[type];
      for (const option of typeConfig.options) {
        const variant = await this.generateVariant(ast, {
          name,
          type,
          option,
          typeConfig,
          componentConfig
        });
        variants.push(variant);
      }
    }

    return variants;
  }

  async generateVariant(ast, { name, type, option, typeConfig, componentConfig }) {
    const variantName = `${name}${this.capitalizeFirst(type)}${this.capitalizeFirst(option)}`;
    const variantCode = this.transformAst(ast, {
      name: variantName,
      type,
      option,
      typeConfig,
      componentConfig
    });

    const variantPath = `src/components/${name}/${variantName}.tsx`;
    await this.saveVariant(variantPath, variantCode);

    return {
      name: variantName,
      type,
      option,
      path: variantPath,
      code: variantCode
    };
  }

  transformAst(ast, { name, type, option, typeConfig, componentConfig }) {
    const clonedAst = this.cloneAst(ast);

    traverse(clonedAst, {
      // Actualizar nombre del componente
      FunctionDeclaration(path) {
        if (path.node.id.name === componentConfig.name) {
          path.node.id.name = name;
        }
      },

      // Actualizar props por defecto
      VariableDeclarator(path) {
        if (path.node.id.name === componentConfig.name) {
          path.node.id.name = name;
        }
      },

      // Actualizar clases CSS
      JSXAttribute(path) {
        if (path.node.name.name === 'className') {
          const value = path.node.value.value;
          const updatedValue = this.updateClassNames(value, type, option, typeConfig);
          path.node.value.value = updatedValue;
        }
      },

      // Actualizar tipos TypeScript
      TSInterfaceDeclaration(path) {
        if (path.node.id.name.includes('Props')) {
          path.node.id.name = `${name}Props`;
        }
      }
    });

    return generate(clonedAst).code;
  }

  updateClassNames(value, type, option, typeConfig) {
    let updatedValue = value;
    const properties = typeConfig.properties;

    // Actualizar clases según el tipo de variante
    for (const [propName, propValues] of Object.entries(properties)) {
      const oldClass = this.findExistingClass(value, Object.values(propValues));
      if (oldClass) {
        updatedValue = updatedValue.replace(oldClass, propValues[option]);
      } else {
        updatedValue = `${updatedValue} ${propValues[option]}`;
      }
    }

    return updatedValue;
  }

  findExistingClass(value, possibleClasses) {
    return possibleClasses.find(cls => value.includes(cls));
  }

  async saveVariant(variantPath, code) {
    await fs.mkdir(path.dirname(variantPath), { recursive: true });
    await fs.writeFile(variantPath, code);
  }

  cloneAst(ast) {
    return JSON.parse(JSON.stringify(ast));
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async generateVariantTests(component) {
    const { name, variants } = component;
    const testCode = `
      import React from 'react';
      import { render, screen } from '@testing-library/react';
      import userEvent from '@testing-library/user-event';
      
      ${variants.map(variant => `import { ${variant.name} } from './${variant.name}';`).join('\n')}
      
      describe('${name} Variants', () => {
        ${variants.map(variant => `
          describe('${variant.name}', () => {
            it('renders correctly', () => {
              render(<${variant.name} />);
              expect(screen.getByRole('${this.getAriaRole(name)}')).toBeInTheDocument();
            });
            
            it('applies correct styles', () => {
              render(<${variant.name} />);
              const element = screen.getByRole('${this.getAriaRole(name)}');
              expect(element).toHaveClass('${this.getExpectedClasses(variant)}');
            });
            
            ${this.generateInteractionTests(variant)}
          });
        `).join('\n')}
      });
    `;

    const testPath = `src/components/${name}/${name}.test.tsx`;
    await fs.writeFile(testPath, testCode);

    return {
      path: testPath,
      code: testCode
    };
  }

  getAriaRole(componentName) {
    const roleMap = {
      Button: 'button',
      Input: 'textbox',
      Card: 'article',
      Typography: 'text'
    };
    return roleMap[componentName] || 'generic';
  }

  getExpectedClasses(variant) {
    const { type, option, typeConfig } = variant;
    const properties = typeConfig.properties;
    return Object.values(properties)
      .map(propValues => propValues[option])
      .join(' ');
  }

  generateInteractionTests(variant) {
    const { type } = variant;
    switch (type) {
      case 'state':
        return `
          it('responds to user interaction', async () => {
            render(<${variant.name} />);
            const element = screen.getByRole('${this.getAriaRole(variant.name)}');
            await userEvent.hover(element);
            expect(element).toHaveClass('hover:opacity-90');
            await userEvent.unhover(element);
            expect(element).not.toHaveClass('hover:opacity-90');
          });
        `;
      case 'theme':
        return `
          it('applies theme correctly', () => {
            render(<${variant.name} />);
            const element = screen.getByRole('${this.getAriaRole(variant.name)}');
            expect(element).toHaveClass('${this.getExpectedClasses(variant)}');
          });
        `;
      default:
        return '';
    }
  }
}

export default ComponentGenerator;
