// Main JavaScript - Simple and Working Version

let currentSection = 'colors';

// Load section content
function loadSectionContent(sectionId) {
    const contentMap = {
        colors: `
            <div class="content-header">
                <h2>🌈 Sistema de Colores</h2>
                <p>Paleta de colores del sistema de diseño</p>
            </div>
            
            <div class="section">
                <h3>🎨 Colores Primarios</h3>
                <div class="demo-group">
                    <div class="color-grid">
                        <div class="color-item" data-color="#3B82F6">
                            <div class="color-swatch brand-primary"></div>
                            <div class="color-info">
                                <span class="color-name">Primary</span>
                                <span class="color-hex">#3B82F6</span>
                            </div>
                        </div>
                        <div class="color-item" data-color="#1E40AF">
                            <div class="color-swatch brand-primary-dark"></div>
                            <div class="color-info">
                                <span class="color-name">Primary Dark</span>
                                <span class="color-hex">#1E40AF</span>
                            </div>
                        </div>
                        <div class="color-item" data-color="#60A5FA">
                            <div class="color-swatch brand-primary-light"></div>
                            <div class="color-info">
                                <span class="color-name">Primary Light</span>
                                <span class="color-hex">#60A5FA</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h3>✅ Colores Semánticos</h3>
                <div class="demo-group">
                    <div class="color-grid">
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
                        <div class="color-item" data-color="#F59E0B">
                            <div class="color-swatch semantic-warning"></div>
                            <div class="color-info">
                                <span class="color-name">Warning</span>
                                <span class="color-hex">#F59E0B</span>
                            </div>
                        </div>
                        <div class="color-item" data-color="#3B82F6">
                            <div class="color-swatch semantic-info"></div>
                            <div class="color-info">
                                <span class="color-name">Info</span>
                                <span class="color-hex">#3B82F6</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- COMPARACIÓN LADO A LADO -->
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
                        <div class="color-item" data-color="#F59E0B">
                            <div class="color-swatch semantic-warning"></div>
                            <div class="color-info">
                                <span class="color-name">Warning</span>
                                <span class="color-hex">#F59E0B</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="theme-section dark">
                    <div class="theme-label">�� Modo Oscuro</div>
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
                        <div class="color-item" data-color="#F59E0B">
                            <div class="color-swatch semantic-warning"></div>
                            <div class="color-info">
                                <span class="color-name">Warning</span>
                                <span class="color-hex">#F59E0B</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        buttons: `
            <div class="content-header">
                <h2>🔘 Botones</h2>
                <p>Componentes de botones del sistema</p>
            </div>
            
            <div class="section">
                <h3>🎨 Tipos de Botones</h3>
                <div class="demo-group">
                    <div class="demo-items">
                        <button class="btn btn-primary">Primary</button>
                        <button class="btn btn-secondary">Secondary</button>
                        <button class="btn btn-success">Success</button>
                        <button class="btn btn-error">Error</button>
                        <button class="btn btn-outline">Outline</button>
                        <button class="btn btn-ghost">Ghost</button>
                    </div>
                </div>
                
                <h3>📏 Tamaños</h3>
                <div class="demo-group">
                    <div class="demo-items">
                        <button class="btn btn-primary btn-sm">Small</button>
                        <button class="btn btn-primary">Medium</button>
                        <button class="btn btn-primary btn-lg">Large</button>
                    </div>
                </div>
                
                <h3>⚡ Estados</h3>
                <div class="demo-group">
                    <div class="demo-items">
                        <button class="btn btn-primary">Normal</button>
                        <button class="btn btn-primary" disabled>Disabled</button>
                    </div>
                </div>
            </div>
            
            <!-- COMPARACIÓN LADO A LADO -->
            <div class="theme-comparison">
                <div class="theme-section light">
                    <div class="theme-label">☀️ Modo Claro</div>
                    <h4>Botones en Modo Claro</h4>
                    <div class="demo-items">
                        <button class="btn btn-primary">Primary</button>
                        <button class="btn btn-secondary">Secondary</button>
                        <button class="btn btn-success">Success</button>
                        <button class="btn btn-error">Error</button>
                        <button class="btn btn-outline">Outline</button>
                        <button class="btn btn-ghost">Ghost</button>
                    </div>
                    <div style="margin-top: 20px;">
                        <h5>Tamaños</h5>
                        <div class="demo-items">
                            <button class="btn btn-primary btn-sm">Small</button>
                            <button class="btn btn-primary">Medium</button>
                            <button class="btn btn-primary btn-lg">Large</button>
                        </div>
                    </div>
                </div>
                
                <div class="theme-section dark">
                    <div class="theme-label">🌙 Modo Oscuro</div>
                    <h4>Botones en Modo Oscuro</h4>
                    <div class="demo-items">
                        <button class="btn btn-primary">Primary</button>
                        <button class="btn btn-secondary">Secondary</button>
                        <button class="btn btn-success">Success</button>
                        <button class="btn btn-error">Error</button>
                        <button class="btn btn-outline">Outline</button>
                        <button class="btn btn-ghost">Ghost</button>
                    </div>
                    <div style="margin-top: 20px;">
                        <h5>Tamaños</h5>
                        <div class="demo-items">
                            <button class="btn btn-primary btn-sm">Small</button>
                            <button class="btn btn-primary">Medium</button>
                            <button class="btn btn-primary btn-lg">Large</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        inputs: `
            <div class="content-header">
                <h2>📝 Inputs</h2>
                <p>Componentes de entrada de datos</p>
            </div>
            
            <div class="section">
                <h3>📋 Tipos de Input</h3>
                <div class="demo-group">
                    <div class="demo-items">
                        <input type="text" class="input" placeholder="Input de texto">
                        <input type="email" class="input" placeholder="Input de email">
                        <input type="password" class="input" placeholder="Input de contraseña">
                        <input type="number" class="input" placeholder="Input numérico">
                    </div>
                </div>
                
                <h3>🎯 Estados</h3>
                <div class="demo-group">
                    <div class="demo-items">
                        <input type="text" class="input" placeholder="Normal">
                        <input type="text" class="input input-success" placeholder="Exitoso" value="Correcto">
                        <input type="text" class="input input-error" placeholder="Con error" value="Error">
                        <input type="text" class="input" placeholder="Deshabilitado" disabled>
                    </div>
                </div>
                
                <h3>📝 Textarea</h3>
                <div class="demo-group">
                    <div class="demo-items">
                        <textarea class="input" placeholder="Escribe un mensaje..." rows="3"></textarea>
                    </div>
                </div>
            </div>
            
            <!-- COMPARACIÓN LADO A LADO -->
            <div class="theme-comparison">
                <div class="theme-section light">
                    <div class="theme-label">☀️ Modo Claro</div>
                    <h4>Inputs en Modo Claro</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input Normal</label>
                        <input type="text" class="input" placeholder="Escribe algo aquí...">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input con Foco</label>
                        <input type="text" class="input" placeholder="Input con foco" style="border-color: #3B82F6;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input Exitoso</label>
                        <input type="text" class="input input-success" placeholder="Input exitoso" value="Correcto">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input con Error</label>
                        <input type="text" class="input input-error" placeholder="Input con error" value="Error">
                    </div>
                </div>
                
                <div class="theme-section dark">
                    <div class="theme-label">🌙 Modo Oscuro</div>
                    <h4>Inputs en Modo Oscuro</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input Normal</label>
                        <input type="text" class="input" placeholder="Escribe algo aquí...">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input con Foco</label>
                        <input type="text" class="input" placeholder="Input con foco" style="border-color: #60a5fa;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input Exitoso</label>
                        <input type="text" class="input input-success" placeholder="Input exitoso" value="Correcto">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Input con Error</label>
                        <input type="text" class="input input-error" placeholder="Input con error" value="Error">
                    </div>
                </div>
            </div>
        `,
        
        cards: `
            <div class="content-header">
                <h2>🃏 Cards</h2>
                <p>Componentes de tarjetas</p>
            </div>
            
            <div class="section">
                <h3>🎨 Tipos de Cards</h3>
                <div class="demo-group">
                    <div class="card">
                        <div class="card-header">Card Básico</div>
                        <div class="card-content">Este es un card básico con contenido simple.</div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">Card con Acciones</div>
                        <div class="card-content">Card con botones de acción.</div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-sm">Acción 1</button>
                            <button class="btn btn-outline btn-sm">Acción 2</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">Card con Usuario</div>
                        <div class="card-content">
                            <strong>Juan Pérez</strong><br>
                            Email: juan@ejemplo.com<br>
                            Rol: Administrador
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-sm">Editar</button>
                            <button class="btn btn-error btn-sm">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- COMPARACIÓN LADO A LADO -->
            <div class="theme-comparison">
                <div class="theme-section light">
                    <div class="theme-label">☀️ Modo Claro</div>
                    <h4>Cards en Modo Claro</h4>
                    <div class="card" style="margin-bottom: 15px;">
                        <div class="card-header">Card Básico</div>
                        <div class="card-content">Este es un card básico en modo claro. Tiene un fondo blanco y texto oscuro.</div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-sm">Acción 1</button>
                            <button class="btn btn-outline btn-sm">Acción 2</button>
                        </div>
                    </div>
                </div>
                
                <div class="theme-section dark">
                    <div class="theme-label">🌙 Modo Oscuro</div>
                    <h4>Cards en Modo Oscuro</h4>
                    <div class="card" style="margin-bottom: 15px;">
                        <div class="card-header">Card Básico</div>
                        <div class="card-content">Este es un card básico en modo oscuro. Tiene un fondo oscuro y texto claro.</div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-sm">Acción 1</button>
                            <button class="btn btn-outline btn-sm">Acción 2</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    
    return contentMap[sectionId] || '<p>Contenido no disponible</p>';
}

// Show section
function showSection(sectionId) {
    currentSection = sectionId;
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-menu a');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Load and display content
    const mainContent = document.querySelector('.main-content');
    const content = loadSectionContent(sectionId);
    mainContent.innerHTML = content;
    
    // Setup color copy functionality
    setupColorCopy();
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Setup color copy functionality
function setupColorCopy() {
    const colorItems = document.querySelectorAll('.color-item');
    
    colorItems.forEach(item => {
        item.addEventListener('click', () => {
            const color = item.getAttribute('data-color');
            navigator.clipboard.writeText(color).then(() => {
                // Show feedback
                const originalText = item.querySelector('.color-hex').textContent;
                item.querySelector('.color-hex').textContent = '¡Copiado!';
                setTimeout(() => {
                    item.querySelector('.color-hex').textContent = originalText;
                }, 1000);
            });
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    showSection('colors');
});
