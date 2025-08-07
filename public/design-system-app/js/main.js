// Main JavaScript for Design System App

// Global state
let currentSection = 'colors';
let currentTheme = 'light';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupColorCopy();
});

function initializeApp() {
    // Set initial active section
    showSection('colors');
    
    // Initialize theme
    applyTheme(currentTheme);
    
    // Setup navigation
    setupNavigation();
}

function setupEventListeners() {
    // Menu toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Close modal when clicking outside
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
}

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title
            updatePageTitle(this.textContent);
        });
    });
}

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
    }
}

function updatePageTitle(title) {
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = title;
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    
    if (mainContent) {
        mainContent.classList.toggle('sidebar-open');
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    
    // Update theme button
    const themeButton = document.querySelector('.header-actions .btn');
    if (themeButton) {
        themeButton.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }
}

function applyTheme(theme) {
    document.body.className = theme;
    
    if (theme === 'dark') {
        document.body.style.backgroundColor = '#1f2937';
        document.body.style.color = '#f9fafb';
    } else {
        document.body.style.backgroundColor = '#f5f5f5';
        document.body.style.color = '#333';
    }
}

function setupColorCopy() {
    const colorItems = document.querySelectorAll('.color-item');
    colorItems.forEach(item => {
        item.addEventListener('click', function() {
            const colorHex = this.getAttribute('data-color');
            copyToClipboard(colorHex);
            
            // Visual feedback
            this.classList.add('copied');
            setTimeout(() => {
                this.classList.remove('copied');
            }, 300);
            
            showAlert(`Color ${colorHex} copiado al portapapeles!`);
        });
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
    `;
    
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1001';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.maxWidth = '400px';
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function openModal(type = 'default') {
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    
    if (!modal || !title || !content) return;
    
    switch (type) {
        case 'confirm':
            title.textContent = 'Confirmar Acción';
            content.innerHTML = `
                <p>¿Estás seguro de que quieres realizar esta acción?</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Esta operación no se puede deshacer.</p>
            `;
            break;
        case 'form':
            title.textContent = 'Formulario de Ejemplo';
            content.innerHTML = `
                <form>
                    <div class="form-group">
                        <label for="name">Nombre:</label>
                        <input type="text" id="name" class="input" placeholder="Ingresa tu nombre">
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" class="input" placeholder="Ingresa tu email">
                    </div>
                    <div class="form-group">
                        <label for="message">Mensaje:</label>
                        <textarea id="message" class="input" rows="4" placeholder="Escribe tu mensaje"></textarea>
                    </div>
                </form>
            `;
            break;
        default:
            title.textContent = 'Modal de Ejemplo';
            content.innerHTML = `
                <p>Este es un modal de ejemplo. Puedes cerrarlo haciendo clic en la X o en Cancelar.</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Los modales son útiles para mostrar información adicional o solicitar confirmación del usuario.</p>
            `;
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

function exportDesignSystem() {
    const exportData = {
        colors: getColorData(),
        typography: getTypographyData(),
        spacing: getSpacingData(),
        components: getComponentData(),
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'design-system-export.json';
    link.click();
    
    showAlert('Sistema de diseño exportado exitosamente!', 'success');
}

function getColorData() {
    const colors = {};
    const colorItems = document.querySelectorAll('.color-item');
    
    colorItems.forEach(item => {
        const name = item.querySelector('.color-name').textContent;
        const hex = item.getAttribute('data-color');
        colors[name] = hex;
    });
    
    return colors;
}

function getTypographyData() {
    return {
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
    };
}

function getSpacingData() {
    return {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px'
    };
}

function getComponentData() {
    return {
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
    };
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
