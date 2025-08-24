// Playground JavaScript

// Playground functionality
class DesignSystemPlayground {
    constructor() {
        this.experimentArea = document.getElementById('experimentArea');
        this.draggedComponent = null;
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.setupComponentLibrary();
        this.setupRealTimePreview();
    }
    
    setupDragAndDrop() {
        if (!this.experimentArea) return;
        
        // Make experiment area a drop zone
        this.experimentArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.experimentArea.style.borderColor = '#3B82F6';
            this.experimentArea.style.backgroundColor = '#F0F9FF';
        });
        
        this.experimentArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.experimentArea.style.borderColor = '#D1D5DB';
            this.experimentArea.style.backgroundColor = 'transparent';
        });
        
        this.experimentArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.experimentArea.style.borderColor = '#D1D5DB';
            this.experimentArea.style.backgroundColor = 'transparent';
            
            const componentType = e.dataTransfer.getData('text/plain');
            this.addComponentToPlayground(componentType);
        });
    }
    
    setupComponentLibrary() {
        // Create draggable component library
        const library = this.createComponentLibrary();
        if (this.experimentArea) {
            this.experimentArea.appendChild(library);
        }
    }
    
    createComponentLibrary() {
        const library = document.createElement('div');
        library.className = 'component-library';
        library.innerHTML = `
            <h4>Biblioteca de Componentes</h4>
            <div class="component-items">
                <div class="component-item" draggable="true" data-component="button">
                    <button class="btn btn-primary btn-sm">Botón</button>
                    <span>Arrastra para usar</span>
                </div>
                <div class="component-item" draggable="true" data-component="input">
                    <input type="text" class="input" placeholder="Input" readonly>
                    <span>Arrastra para usar</span>
                </div>
                <div class="component-item" draggable="true" data-component="card">
                    <div class="card" style="transform: scale(0.8);">
                        <div class="card-header">Card</div>
                        <div class="card-content">Contenido</div>
                    </div>
                    <span>Arrastra para usar</span>
                </div>
                <div class="component-item" draggable="true" data-component="alert">
                    <div class="alert alert-info" style="transform: scale(0.8);">Alerta</div>
                    <span>Arrastra para usar</span>
                </div>
            </div>
        `;
        
        // Setup drag events for component items
        const componentItems = library.querySelectorAll('.component-item');
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.component);
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });
        });
        
        return library;
    }
    
    addComponentToPlayground(componentType) {
        if (!this.experimentArea) return;
        
        let componentHTML = '';
        
        switch (componentType) {
            case 'button':
                componentHTML = `
                    <div class="playground-component">
                        <button class="btn btn-primary" onclick="showAlert('¡Botón clickeado!')">
                            Botón Interactivo
                        </button>
                        <button class="btn btn-sm" onclick="this.parentElement.remove()" style="margin-left: 10px; background: #EF4444; color: white;">
                            ×
                        </button>
                    </div>
                `;
                break;
            case 'input':
                componentHTML = `
                    <div class="playground-component">
                        <input type="text" class="input" placeholder="Input interactivo" oninput="this.nextElementSibling.textContent = 'Valor: ' + this.value">
                        <div style="font-size: 0.9rem; color: #6b7280; margin-top: 5px;">Valor: </div>
                        <button class="btn btn-sm" onclick="this.parentElement.remove()" style="margin-top: 10px; background: #EF4444; color: white;">
                            ×
                        </button>
                    </div>
                `;
                break;
            case 'card':
                componentHTML = `
                    <div class="playground-component">
                        <div class="card">
                            <div class="card-header">Card Interactivo</div>
                            <div class="card-content">Este es un card que puedes personalizar.</div>
                            <div class="card-actions">
                                <button class="btn btn-primary btn-sm" onclick="showAlert('Acción ejecutada!')">Acción</button>
                                <button class="btn btn-sm" onclick="this.closest('.playground-component').remove()" style="background: #EF4444; color: white;">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'alert':
                componentHTML = `
                    <div class="playground-component">
                        <div class="alert alert-info">
                            Esta es una alerta interactiva
                            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
                        </div>
                    </div>
                `;
                break;
        }
        
        if (componentHTML) {
            // Clear the initial message
            if (this.experimentArea.querySelector('p')) {
                this.experimentArea.innerHTML = '';
            }
            
            this.experimentArea.insertAdjacentHTML('beforeend', componentHTML);
            showAlert(`Componente ${componentType} agregado al playground!`, 'success');
        }
    }
    
    setupRealTimePreview() {
        // Setup real-time preview updates
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.updatePlaygroundStats();
                }
            });
        });
        
        if (this.experimentArea) {
            observer.observe(this.experimentArea, {
                childList: true,
                subtree: true
            });
        }
    }
    
    updatePlaygroundStats() {
        const components = this.experimentArea.querySelectorAll('.playground-component');
        const stats = {
            buttons: components.filter(c => c.querySelector('.btn')).length,
            inputs: components.filter(c => c.querySelector('.input')).length,
            cards: components.filter(c => c.querySelector('.card')).length,
            alerts: components.filter(c => c.querySelector('.alert')).length
        };
        
        // Update stats display if it exists
        const statsDisplay = document.querySelector('.playground-stats');
        if (statsDisplay) {
            statsDisplay.innerHTML = `
                <strong>Componentes en el playground:</strong>
                Botones: ${stats.buttons} | 
                Inputs: ${stats.inputs} | 
                Cards: ${stats.cards} | 
                Alertas: ${stats.alerts}
            `;
        }
    }
}

// CSS for playground
const playgroundStyles = `
<style>
.component-library {
    margin-bottom: 30px;
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.component-library h4 {
    margin-bottom: 15px;
    color: #1f2937;
}

.component-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.component-item {
    background: white;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    text-align: center;
    cursor: grab;
    transition: transform 0.2s;
}

.component-item:hover {
    transform: translateY(-2px);
    border: 1px solid #F1F5F9;
}

.component-item:active {
    cursor: grabbing;
}

.component-item span {
    display: block;
    font-size: 0.8rem;
    color: #6b7280;
    margin-top: 8px;
}

.playground-component {
    margin: 15px 0;
    padding: 15px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    position: relative;
}

.playground-component:hover {
    border-color: #3b82f6;
}

.experiment-area {
    min-height: 300px;
    padding: 20px;
}

.playground-stats {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1f2937;
    color: white;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 0.9rem;
    z-index: 1000;
}
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', playgroundStyles);

// Initialize playground when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('playground')) {
        new DesignSystemPlayground();
    }
});

// Export playground functionality
window.DesignSystemPlayground = DesignSystemPlayground;
