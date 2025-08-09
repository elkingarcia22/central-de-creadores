import React, { useState } from 'react';
import { Layout, Typography, Card, Button, Tabs } from '../components/ui';
import ColorsSection from '../components/design-system/ColorsSection';
import TypographySection from '../components/design-system/TypographySection';
import ComponentsSection from '../components/design-system/ComponentsSection';
import SpacingSection from '../components/design-system/SpacingSection';
import IconsSection from '../components/design-system/IconsSection';
import { 
  PaletteIcon, 
  TypeIcon, 
  BoxIcon, 
  GridIcon, 
  EyeIcon
} from '../components/icons';


const DesignSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Colores', icon: PaletteIcon },
    { id: 'typography', label: 'Tipografía', icon: TypeIcon },
    { id: 'components', label: 'Componentes', icon: BoxIcon },
    { id: 'spacing', label: 'Espaciado', icon: GridIcon },
    { id: 'icons', label: 'Iconos', icon: EyeIcon },
  ];

  return (
    <Layout rol="administrador">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-2">
            <div>
              <Typography variant="h1" weight="bold" className="text-foreground">
                Sistema de Diseño
              </Typography>
              <Typography variant="body2" color="secondary" className="mt-1">
                Plataforma visual de componentes, colores y patrones de diseño
              </Typography>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6">
            <Tabs
              tabs={tabs.map(tab => ({
                id: tab.id,
                label: tab.label,
                icon: <tab.icon className="w-4 h-4" />,
                content: null
              }))}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              defaultActiveTab="colors"
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="container mx-auto px-6 py-2">
          {activeTab === 'colors' && <ColorsSection />}
          {activeTab === 'typography' && <TypographySection />}
          {activeTab === 'components' && <ComponentsSection />}
          {activeTab === 'spacing' && <SpacingSection />}
          {activeTab === 'icons' && <IconsSection />}
        </div>
      </div>
    </Layout>
  );
};

export default DesignSystemPage;
