// Components JavaScript

// Component interaction functions
function updateLiveText() {
    const input = document.getElementById('liveInput');
    const text = document.getElementById('liveText');
    if (input && text) {
        text.textContent = `Texto en tiempo real: ${input.value}`;
    }
}

function toggleBadge(badge) {
    badge.style.opacity = badge.style.opacity === '0.5' ? '1' : '0.5';
    showAlert(`Badge ${badge.textContent} ${badge.style.opacity === '0.5' ? 'desactivado' : 'activado'}`);
}

function updateProgress(value) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
        progressBar.style.width = value + '%';
    }
    
    if (progressText) {
        progressText.textContent = `Progreso: ${value}%`;
    }
}

function toggleSwitch(checkbox) {
    const status = document.getElementById('switchStatus');
    if (status) {
        status.textContent = checkbox.checked ? 'Activado' : 'Desactivado';
        showAlert(`Switch ${checkbox.checked ? 'activado' : 'desactivado'}`);
    }
}

function toggleOption(option, checkbox) {
    showAlert(`${option} ${checkbox.checked ? 'activado' : 'desactivado'}`);
}

// Component generator
function generateComponent() {
    const type = document.getElementById('componentType').value;
    const color = document.getElementById('componentColor').value;
    const size = document.getElementById('componentSize').value;
    
    const preview = document.getElementById('componentPreview');
    if (!preview) return;
    
    let componentHTML = '';
    
    switch (type) {
        case 'button':
            componentHTML = `<button class="btn btn-primary btn-${size}" style="background-color: ${color}; border-color: ${color};">Botón Generado</button>`;
            break;
        case 'input':
            componentHTML = `<input type="text" class="input" style="border-color: ${color};" placeholder="Input generado">`;
            break;
        case 'card':
            componentHTML = `
                <div class="card" style="border-color: ${color};">
                    <div class="card-header">Card Generado</div>
                    <div class="card-content">Este es un card generado dinámicamente.</div>
                    <div class="card-actions">
                        <button class="btn btn-primary btn-sm" style="background-color: ${color};">Acción</button>
                    </div>
                </div>
            `;
            break;
        case 'alert':
            componentHTML = `<div class="alert alert-info" style="border-left-color: ${color}; background-color: ${color}20;">Alerta generada</div>`;
            break;
    }
    
    preview.innerHTML = componentHTML;
    showAlert('Componente generado exitosamente!', 'success');
}

// Export functions
function exportCSS() {
    const cssContent = generateCSS();
    downloadFile(cssContent, 'design-system.css', 'text/css');
    showAlert('CSS exportado exitosamente!', 'success');
}

function exportJSON() {
    const jsonContent = generateJSON();
    downloadFile(jsonContent, 'design-system.json', 'application/json');
    showAlert('JSON exportado exitosamente!', 'success');
}

function exportDocumentation() {
    const docContent = generateDocumentation();
    downloadFile(docContent, 'design-system-docs.md', 'text/markdown');
    showAlert('Documentación exportada exitosamente!', 'success');
}

function generateCSS() {
    return `/* Design System CSS - Generated */
:root {
    /* Colors */
    --color-primary: #3B82F6;
    --color-success: #10B981;
    --color-error: #EF4444;
    --color-warning: #F59E0B;
    --color-info: #3B82F6;
    
    /* Typography */
    --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
}

/* Button Styles */
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background-color: var(--color-primary);
    color: white;
}

.btn-success {
    background-color: var(--color-success);
    color: white;
}

.btn-error {
    background-color: var(--color-error);
    color: white;
}

/* Input Styles */
.input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #E5E7EB;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.input:focus {
    outline: none;
    border-color: var(--color-primary);
}

/* Card Styles */
.card {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 20px;
    background: white;
    border: 1px solid #F1F5F9;
}

/* Alert Styles */
.alert {
    padding: 12px 16px;
    border-radius: 6px;
    margin: 10px 0;
    border-left: 4px solid;
}

.alert-info {
    background-color: #DBEAFE;
    border-left-color: var(--color-info);
    color: #1E40AF;
}

.alert-success {
    background-color: #D1FAE5;
    border-left-color: var(--color-success);
    color: #065F46;
}

.alert-error {
    background-color: #FEE2E2;
    border-left-color: var(--color-error);
    color: #991B1B;
}`;
}

function generateJSON() {
    return JSON.stringify({
        version: '1.0.0',
        name: 'Central de Creadores Design System',
        colors: {
            primary: '#3B82F6',
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6',
            neutral: {
                white: '#FFFFFF',
                black: '#000000',
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827'
                }
            }
        },
        typography: {
            fontFamily: {
                primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                serif: 'Georgia, "Times New Roman", serif',
                mono: '"Monaco", "Menlo", "Ubuntu Mono", monospace'
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem'
            },
            fontWeight: {
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800
            }
        },
        spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
            '2xl': '48px'
        },
        components: {
            buttons: {
                variants: ['primary', 'secondary', 'success', 'error', 'outline', 'ghost'],
                sizes: ['sm', 'md', 'lg']
            },
            inputs: {
                types: ['text', 'email', 'password', 'textarea', 'select'],
                states: ['default', 'focus', 'error', 'success', 'disabled']
            },
            cards: {
                variants: ['default', 'interactive', 'with-actions']
            }
        }
    }, null, 2);
}

function generateDocumentation() {
    return `# Design System - Central de Creadores

## Descripción
Sistema de diseño completo para la plataforma Central de Creadores.

## Colores

### Brand Colors
- **Primary**: #3B82F6 - Color principal de la marca

### Semantic Colors
- **Success**: #10B981 - Para acciones exitosas
- **Error**: #EF4444 - Para errores y alertas
- **Warning**: #F59E0B - Para advertencias
- **Info**: #3B82F6 - Para información

### Neutral Colors
Escala de grises del 50 al 900 para diferentes usos.

## Tipografía

### Font Family
- **Primary**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
- **Serif**: Georgia, 'Times New Roman', serif
- **Mono**: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace

### Font Sizes
- **XS**: 0.75rem
- **SM**: 0.875rem
- **Base**: 1rem
- **LG**: 1.125rem
- **XL**: 1.25rem
- **2XL**: 1.5rem
- **3XL**: 1.875rem
- **4XL**: 2.25rem

## Espaciado

### Scale
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **2XL**: 48px

## Componentes

### Botones
Variantes: primary, secondary, success, error, outline, ghost
Tamaños: sm, md, lg

### Inputs
Tipos: text, email, password, textarea, select
Estados: default, focus, error, success, disabled

### Cards
Variantes: default, interactive, with-actions

### Alertas
Tipos: info, success, warning, error

## Uso

### CSS Variables
\`\`\`css
:root {
    --color-primary: #3B82F6;
    --spacing-md: 16px;
    --font-size-base: 1rem;
}
\`\`\`

### Clases Utilitarias
\`\`\`html
<button class="btn btn-primary btn-lg">Botón Grande</button>
<div class="card p-4">Card con padding</div>
\`\`\`
`;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Theme functions
function changeTheme(theme) {
    currentTheme = theme;
    applyTheme(theme);
    showAlert(`Tema cambiado a: ${theme}`);
}

function toggleSection(section) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => {
        if (s.querySelector('h3').textContent.toLowerCase().includes(section)) {
            s.style.display = s.style.display === 'none' ? 'block' : 'none';
        }
    });
}

// Initialize component interactions
document.addEventListener('DOMContentLoaded', function() {
    // Setup component interactions
    setupComponentInteractions();
});

function setupComponentInteractions() {
    // Setup live input
    const liveInput = document.getElementById('liveInput');
    if (liveInput) {
        liveInput.addEventListener('input', updateLiveText);
    }
    
    // Setup progress bar
    const progressRange = document.querySelector('input[type="range"]');
    if (progressRange) {
        progressRange.addEventListener('input', function() {
            updateProgress(this.value);
        });
    }
    
    // Setup component generator
    const componentType = document.getElementById('componentType');
    const componentColor = document.getElementById('componentColor');
    const componentSize = document.getElementById('componentSize');
    
    if (componentType && componentColor && componentSize) {
        [componentType, componentColor, componentSize].forEach(element => {
            element.addEventListener('change', generateComponent);
        });
    }
}
