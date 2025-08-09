import React, { useState } from 'react';

const TestActionsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Test Acción 1',
      icon: <span>🔴</span>,
      onClick: () => console.log('Test 1'),
      className: 'text-red-600'
    },
    {
      label: 'Test Acción 2',
      icon: <span>🟢</span>,
      onClick: () => console.log('Test 2'),
      className: 'text-green-600'
    }
  ];

  return (
    <div className="relative">
      {/* Botón de prueba */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-red-500 text-white rounded"
      >
        🔴 TEST MENU
      </button>

      {/* Menú de prueba */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-red-500 border-4 border-blue-500 rounded-lg shadow-lg p-4 z-50">
          <div className="text-white font-bold mb-2">🔴 MENU ROJO FUNCIONA</div>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="block w-full text-left p-2 text-white hover:bg-red-600 rounded"
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestActionsMenu;
