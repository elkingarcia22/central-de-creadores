// Comparison Loader JavaScript

// Load comparison components
async function loadComparison(componentName) {
    try {
        const response = await fetch(`components/${componentName}-comparison.html`);
        const html = await response.text();
        return html;
    } catch (error) {
        console.error(`Error loading ${componentName} comparison:`, error);
        return '';
    }
}

// Insert comparison into section
function insertComparison(sectionId, comparisonHTML) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Check if comparison already exists
    if (section.querySelector('.theme-comparison')) return;
    
    // Insert after the first demo-group or at the end
    const firstDemoGroup = section.querySelector('.demo-group');
    if (firstDemoGroup) {
        firstDemoGroup.insertAdjacentHTML('afterend', comparisonHTML);
    } else {
        section.insertAdjacentHTML('beforeend', comparisonHTML);
    }
    
    // Setup color copy for new elements
    setupColorCopy();
}

// Enhanced showSection function
async function showSection(sectionId) {
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
        
        // Load and insert comparison for specific sections
        if (['colors', 'buttons', 'inputs', 'cards'].includes(sectionId)) {
            setTimeout(async () => {
                const comparisonHTML = await loadComparison(sectionId);
                if (comparisonHTML) {
                    insertComparison(sectionId, comparisonHTML);
                }
            }, 100);
        }
    }
}

// Initialize comparisons
document.addEventListener('DOMContentLoaded', async function() {
    // Load initial comparison if on a supported section
    if (['colors', 'buttons', 'inputs', 'cards'].includes(currentSection)) {
        setTimeout(async () => {
            const comparisonHTML = await loadComparison(currentSection);
            if (comparisonHTML) {
                insertComparison(currentSection, comparisonHTML);
            }
        }, 200);
    }
});

// Export functions
window.loadComparison = loadComparison;
window.insertComparison = insertComparison;
window.showSection = showSection;
