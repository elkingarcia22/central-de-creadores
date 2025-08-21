import React from 'react';
import { Typography } from './index';

const KanbanBoardTest: React.FC = () => {
  return (
    <div className="p-4 border rounded">
      <Typography variant="h4">KanbanBoard Test</Typography>
      <Typography variant="body1">Este es un componente de prueba para verificar que las importaciones funcionan correctamente.</Typography>
    </div>
  );
};

export default KanbanBoardTest;
