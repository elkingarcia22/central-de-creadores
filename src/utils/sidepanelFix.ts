// 🔧 UTILIDAD PARA FIX DE SIDEPANELS

/**
 * Aplica las clases CSS de fix a los sidepanels existentes
 */
export const applySidePanelFix = () => {
  console.log('🔧 Aplicando fix de sidepanels y Layout...');
  
  // Buscar todos los contenedores de sidepanels
  const sidePanelContainers = document.querySelectorAll('[class*="fixed inset-0"][class*="z-50"]');
  console.log('🔧 Contenedores encontrados:', sidePanelContainers.length);
  
  sidePanelContainers.forEach((container, index) => {
    const element = container as HTMLElement;
    console.log(`🔧 Aplicando fix al contenedor ${index + 1}:`, element);
    
    // Aplicar clases CSS
    element.classList.add('sidepanel-container');
    element.classList.add('sidepanel-debug');
    
    // Forzar altura
    element.style.height = '100vh';
    element.style.minHeight = '100vh';
    element.style.maxHeight = '100vh';
    element.style.top = '0';
    element.style.left = '0';
    element.style.right = '0';
    element.style.bottom = '0';
    element.style.width = '100vw';
    element.style.minWidth = '100vw';
    element.style.maxWidth = '100vw';
    
    // Buscar overlay dentro del contenedor
    const overlay = element.querySelector('[class*="absolute inset-0"][class*="bg-black"]');
    if (overlay) {
      const overlayElement = overlay as HTMLElement;
      console.log(`🔧 Aplicando fix al overlay ${index + 1}:`, overlayElement);
      
      overlayElement.classList.add('sidepanel-overlay');
      overlayElement.classList.add('sidepanel-debug-overlay');
      
      overlayElement.style.height = '100vh';
      overlayElement.style.minHeight = '100vh';
      overlayElement.style.maxHeight = '100vh';
      overlayElement.style.top = '0';
      overlayElement.style.left = '0';
      overlayElement.style.right = '0';
      overlayElement.style.bottom = '0';
      overlayElement.style.width = '100vw';
      overlayElement.style.minWidth = '100vw';
      overlayElement.style.maxWidth = '100vw';
    }
    
    // Buscar drawer dentro del contenedor
    const drawer = element.querySelector('[class*="absolute right-0"][class*="top-0"], [class*="absolute left-0"][class*="top-0"]');
    if (drawer) {
      const drawerElement = drawer as HTMLElement;
      console.log(`🔧 Aplicando fix al drawer ${index + 1}:`, drawerElement);
      
      drawerElement.classList.add('sidepanel-drawer');
      drawerElement.classList.add('sidepanel-debug-drawer');
      
      drawerElement.style.height = '100vh';
      drawerElement.style.minHeight = '100vh';
      drawerElement.style.maxHeight = '100vh';
      drawerElement.style.top = '0';
      drawerElement.style.bottom = '0';
    }
    
    // Buscar contenedor interno
    const content = element.querySelector('[class*="flex flex-col"][class*="h-full"]');
    if (content) {
      const contentElement = content as HTMLElement;
      console.log(`🔧 Aplicando fix al contenido ${index + 1}:`, contentElement);
      
      contentElement.classList.add('sidepanel-content');
      
      contentElement.style.height = '100vh';
      contentElement.style.minHeight = '100vh';
      contentElement.style.maxHeight = '100vh';
    }
  });
  
  // Aplicar fix al Layout
  console.log('🔧 Aplicando fix al Layout...');
  
  // Buscar elementos del Layout problemáticos
  const layoutElements = document.querySelectorAll('.min-h-screen, .flex-1, main, .mx-auto.max-w-7xl, .overflow-y-visible');
  console.log('🔧 Elementos del Layout encontrados:', layoutElements.length);
  
  layoutElements.forEach((layoutElement, index) => {
    const element = layoutElement as HTMLElement;
    console.log(`🔧 Aplicando fix al elemento del Layout ${index + 1}:`, element);
    
    // Aplicar clases de debug
    if (element.classList.contains('min-h-screen')) {
      element.classList.add('layout-debug');
    }
    if (element.classList.contains('flex-1')) {
      element.classList.add('layout-debug');
    }
    if (element.tagName === 'MAIN') {
      element.classList.add('layout-debug-main');
    }
    if (element.classList.contains('mx-auto') && element.classList.contains('max-w-7xl')) {
      element.classList.add('layout-debug-container');
    }
    
    // Forzar estilos para prevenir interferencia
    element.style.overflow = 'hidden';
    element.style.height = '100vh';
    element.style.width = '100vw';
    element.style.maxWidth = '100vw';
  });
  
  // Aplicar clase al body para prevenir scroll y activar CSS del Layout
  document.body.classList.add('sidepanel-open');
  document.documentElement.classList.add('sidepanel-open');
  
  console.log('🔧 Fix de sidepanels y Layout aplicado correctamente');
};

/**
 * Remueve las clases CSS de fix de los sidepanels
 */
export const removeSidePanelFix = () => {
  console.log('🔧 Removiendo fix de sidepanels y Layout...');
  
  // Remover clases de todos los elementos de sidepanels
  const sidepanelElements = document.querySelectorAll('.sidepanel-container, .sidepanel-overlay, .sidepanel-drawer, .sidepanel-content');
  sidepanelElements.forEach(element => {
    const el = element as HTMLElement;
    el.classList.remove('sidepanel-container', 'sidepanel-overlay', 'sidepanel-drawer', 'sidepanel-content');
    el.classList.remove('sidepanel-debug', 'sidepanel-debug-overlay', 'sidepanel-debug-drawer');
  });
  
  // Remover clases de todos los elementos del Layout
  const layoutElements = document.querySelectorAll('.layout-debug, .layout-debug-main, .layout-debug-container');
  layoutElements.forEach(element => {
    const el = element as HTMLElement;
    el.classList.remove('layout-debug', 'layout-debug-main', 'layout-debug-container');
  });
  
  // Remover clases del body
  document.body.classList.remove('sidepanel-open');
  document.documentElement.classList.remove('sidepanel-open');
  
  console.log('🔧 Fix de sidepanels y Layout removido correctamente');
};

/**
 * Observador de mutaciones para aplicar fix automáticamente
 */
export const createSidePanelObserver = () => {
  console.log('🔧 Creando observador de sidepanels...');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.classList.contains('fixed') && element.classList.contains('inset-0') && element.classList.contains('z-50')) {
              console.log('🔧 Nuevo sidepanel detectado, aplicando fix...');
              setTimeout(() => applySidePanelFix(), 100);
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

/**
 * Inicializar el sistema de fix de sidepanels
 */
export const initSidePanelFix = () => {
  console.log('🔧 Inicializando sistema de fix de sidepanels...');
  
  // Aplicar fix a sidepanels existentes
  setTimeout(() => applySidePanelFix(), 100);
  
  // Crear observador para sidepanels futuros
  const observer = createSidePanelObserver();
  
  // Limpiar al desmontar
  return () => {
    observer.disconnect();
    removeSidePanelFix();
  };
};

/**
 * Hook para usar en componentes React
 */
export const useSidePanelFix = () => {
  const applyFix = () => {
    setTimeout(() => applySidePanelFix(), 100);
  };
  
  const removeFix = () => {
    removeSidePanelFix();
  };
  
  return { applyFix, removeFix };
};
