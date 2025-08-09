import React, { useState } from 'react';
import { Layout, Typography, Card, Button, Tabs } from '../components/ui';
import ColorsSection from '../components/design-system/ColorsSection';
import TypographySection from '../components/design-system/TypographySection';
import ComponentsSection from '../components/design-system/ComponentsSection';
import SpacingSection from '../components/design-system/SpacingSection';
import IconsSection from '../components/design-system/IconsSection';
import ElevationSection from '../components/design-system/ElevationSection';
import { 
  PaletteIcon, 
  TypeIcon, 
  BoxIcon, 
  GridIcon, 
  EyeIcon,
  ElevationIcon
} from '../components/icons';

const DesignSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Colores', icon: PaletteIcon, content: <ColorsSection /> },
    { id: 'typography', label: 'Tipografía', icon: TypeIcon, content: <TypographySection /> },
    { id: 'components', label: 'Componentes', icon: BoxIcon, content: <ComponentsSection /> },
    { id: 'spacing', label: 'Espaciado', icon: GridIcon, content: <SpacingSection /> },
    { id: 'icons', label: 'Iconos', icon: EyeIcon, content: <IconsSection /> },
    { id: 'elevation', label: 'Elevación', icon: ElevationIcon, content: <ElevationSection /> },
  ];

  return (
    <Layout rol="administrador">
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div>
                <Typography variant="h2" color="title" weight="bold">
                  Sistema de Diseño
                </Typography>
                <Typography variant="subtitle1" color="secondary">
                  Plataforma visual de componentes, colores y patrones de diseño
                </Typography>
              </div>
            </div>
          </div>

          {/* Navegación y Contenido */}
          <Tabs
            tabs={tabs.map(tab => ({
              id: tab.id,
              label: tab.label,
              icon: <tab.icon className="w-4 h-4" />,
              content: tab.content
            }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            defaultActiveTab="colors"
          />
        </div>
      </div>
    </Layout>
  );
};

export default DesignSystemPage;
