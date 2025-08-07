// Themes JavaScript

let currentTheme = 'light';

function switchTheme(theme) {
    currentTheme = theme;
    
    // Update document theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        }
    });
    
    // Update theme toggle in header
    const headerThemeToggle = document.querySelector('.header-actions .theme-toggle');
    if (headerThemeToggle) {
        const headerButtons = headerThemeToggle.querySelectorAll('.theme-btn');
        headerButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            }
        });
    }
    
    // Show theme change notification
    showAlert(`Tema cambiado a: ${theme === 'light' ? 'Claro' : 'Oscuro'}`, 'success');
    
    // Update color copy functionality for new theme
    setupColorCopy();
}

function addThemeComparison(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Check if comparison already exists
    if (section.querySelector('.theme-comparison')) return;
    
    let comparisonHTML = '';
    
    switch (sectionId) {
        case 'colors':
            comparisonHTML = `
                <div class="theme-comparison">
                    <div class="theme-section light">
                        <div class="theme-label">☀️ Modo Claro</div>
                        <h4>Colores en Modo Claro</h4>
                        <div class="color-grid">
                            <div class="color-item" data-color="#3B82F6">
                                <div class="color-swatch brand-primary"></div>
                                <div class="color-info">
                                    <span class="color-name">Primary</span>
                                    <span class="color-hex">#3B82F6</span>
                                </div>
                            </div>
                            <div class="color-item" data-color="#10B981">
                                <div class="color-swatch semantic-success"></div>
                                <div class="color-info">
                                    <span class="color-name">Success</span>
                                    <span class="color-hex">#10B981</span>
                                </div>
                            </div>
                            <div class="color-item" data-color="#EF4444">
                                <div class="color-swatch semantic-error"></div>
                                <div class="color-info">
                                    <span class="color-name">Error</span>
                                    <span class="color-hex">#EF4444</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="theme-section dark">
                        <div class="theme-label">🌙 Modo Oscuro</div>
                        <h4>Colores en Modo Oscuro</h4>
                        <div class="color-grid">
                            <div class="color-item" data-color="#3B82F6">
                                <div class="color-swatch brand-primary"></div>
                                <div class="color-info">
                                    <span class="color-name">Primary</span>
                                    <span class="color-hex">#3B82F6</span>
                                </div>
                            </div>
                            <div class="color-item" data-color="#10B981">
                                <div class="color-swatch semantic-success"></div>
                                <div class="color-info">
                                    <span class="color-name">Success</span>
                                    <span class="color-hex">#10B981</span>
                                </div>
                            </div>
                            <div class="color-item" data-color="#EF4444">
                                <div class="color-swatch semantic-error"></div>
                                <div class="color-info">
                                    <span class="color-name">Error</span>
                                    <span class="color-hex">#EF4444</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'buttons':
        case 'inputs':
        case 'cards':
            comparisonHTML = `
                <div class="theme-comparison">
                    <div class="theme-section light">
                        <div class="theme-label">☀️ Modo Claro</div>
                        <h4>Componentes en Modo Claro</h4>
                        <div class="demo-items">
                            <button class="btn btn-primary">Primary</button>
                            <button class="btn btn-secondary">Secondary</button>
                            <button class="btn btn-success">Success</button>
                        </div>
                        <div style="margin-top: 15px;">
                            <input type="text" class="input" placeholder="Input en modo claro">
                        </div>
                        <div style="margin-top: 15px;">
                            <div class="card">
                                <div class="card-header">Card en Modo Claro</div>
                                <div class="card-content">Este es un ejemplo de card en modo claro.</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="theme-section dark">
                        <div class="theme-label">🌙 Modo Oscuro</div>
                        <h4>Componentes en Modo Oscuro</h4>
                        <div class="demo-items">
                            <button class="btn btn-primary">Primary</button>
                            <button class="btn btn-secondary">Secondary</button>
                            <button class="btn btn-success">Success</button>
                        </div>
                        <div style="margin-top: 15px;">
                            <input type="text" class="input" placeholder="Input en modo oscuro">
                        </div>
                        <div style="margin-top: 15px;">
                            <div class="card">
                                <div class="card-header">Card en Modo Oscuro</div>
                                <div class="card-content">Este es un ejemplo de card en modo oscuro.</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'typography':
            comparisonHTML = `
                <div class="theme-comparison">
                    <div class="theme-section light">
                        <div class="theme-label">☀️ Modo Claro</div>
                        <h4>Tipografía en Modo Claro</h4>
                        <div class="typography-item">
                            <h2>Heading 2</h2>
                            <p class="text-body">Este es un ejemplo de texto del cuerpo en modo claro.</p>
                            <p class="text-small">Texto pequeño en modo claro.</p>
                        </div>
                    </div>
                    
                    <div class="theme-section dark">
                        <div class="theme-label">🌙 Modo Oscuro</div>
                        <h4>Tipografía en Modo Oscuro</h4>
                        <div class="typography-item">
                            <h2>Heading 2</h2>
                            <p class="text-body">Este es un ejemplo de texto del cuerpo en modo oscuro.</p>
                            <p class="text-small">Texto pequeño en modo oscuro.</p>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    if (comparisonHTML) {
        // Insert comparison after the first demo-group
        const firstDemoGroup = section.querySelector('.demo-group');
        if (firstDemoGroup) {
            firstDemoGroup.insertAdjacentHTML('afterend', comparisonHTML);
        } else {
            // If no demo-group, insert at the end of the section
            section.insertAdjacentHTML('beforeend', comparisonHTML);
        }
        
        // Setup color copy for new elements
        setupColorCopy();
    }
}

// Enhanced showSection function to add theme comparisons
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        
        // Add theme comparison for specific sections
        if (['colors', 'buttons', 'inputs', 'cards', 'typography'].includes(sectionId)) {
            setTimeout(() => {
                addThemeComparison(sectionId);
            }, 100);
        }
    }
}

// Initialize theme system
document.addEventListener('DOMContentLoaded', function() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Setup theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            switchTheme(theme);
        });
    });
    
    // Add theme comparison to current section
    if (['colors', 'buttons', 'inputs', 'cards', 'typography'].includes(currentSection)) {
        setTimeout(() => {
            addThemeComparison(currentSection);
        }, 100);
    }
});

// Export theme functions
window.switchTheme = switchTheme;
window.addThemeComparison = addThemeComparison;
