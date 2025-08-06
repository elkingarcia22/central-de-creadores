import React, { useState } from 'react';
import ActionsMenu from './ActionsMenu';
import Tooltip from './Tooltip';
import LinkModal from './LinkModal';

interface IndependentAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'default' | 'link';
  linkType?: 'prueba' | 'resultados';
  currentLink?: string | null;
  onSaveLink?: (link: string) => Promise<void>;
  onDeleteLink?: () => Promise<void>;
}

interface MenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface GroupedActionsProps {
  independentActions: IndependentAction[];
  menuActions: MenuAction[];
  className?: string;
}

const GroupedActions: React.FC<GroupedActionsProps> = ({
  independentActions,
  menuActions,
  className = ''
}) => {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [currentLinkAction, setCurrentLinkAction] = useState<IndependentAction | null>(null);

  const handleLinkClick = (action: IndependentAction) => {
    if (action.type === 'link' && action.onSaveLink) {
      setCurrentLinkAction(action);
      setLinkModalOpen(true);
    } else {
      action.onClick();
    }
  };

  const handleSaveLink = async (link: string) => {
    if (currentLinkAction?.onSaveLink) {
      await currentLinkAction.onSaveLink(link);
      setLinkModalOpen(false);
      setCurrentLinkAction(null);
    }
  };

  const handleDeleteLink = async () => {
    if (currentLinkAction?.onDeleteLink) {
      await currentLinkAction.onDeleteLink();
      setLinkModalOpen(false);
      setCurrentLinkAction(null);
    }
  };

  const getModalTitle = () => {
    if (!currentLinkAction?.linkType) return '';
    return currentLinkAction.linkType === 'prueba' 
      ? 'Gestionar Link de Prueba'
      : 'Gestionar Link de Resultados';
  };

  const getModalDescription = () => {
    if (!currentLinkAction?.linkType) return '';
    return currentLinkAction.linkType === 'prueba'
      ? 'Configura el enlace donde los participantes realizarán las pruebas de usabilidad'
      : 'Configura el enlace donde se pueden consultar los resultados y hallazgos';
  };

  const getModalPlaceholder = () => {
    if (!currentLinkAction?.linkType) return 'https://ejemplo.com';
    return currentLinkAction.linkType === 'prueba'
      ? 'https://prototipo.ejemplo.com'
      : 'https://resultados.ejemplo.com';
  };

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`} data-inline-edit="true">
        {/* Iconos independientes con tooltips */}
        {independentActions.map((action, index) => (
          <Tooltip key={index} content={action.label} position="top">
            <button
              onClick={() => handleLinkClick(action)}
              disabled={action.disabled}
              className={`
                p-1 rounded transition-colors duration-200
                hover:bg-gray-100 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed
                ${action.className || 'text-gray-600 dark:text-gray-300'}
              `}
            >
              {action.icon}
            </button>
          </Tooltip>
        ))}
        
        {/* Menú desplegable */}
        {menuActions.length > 0 && (
          <ActionsMenu actions={menuActions} />
        )}
      </div>

      {/* Modal para gestionar links */}
      {currentLinkAction && (
        <LinkModal
          isOpen={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          title={getModalTitle()}
          description={getModalDescription()}
          placeholder={getModalPlaceholder()}
          currentLink={currentLinkAction.currentLink}
          onSave={handleSaveLink}
          onDelete={currentLinkAction.onDeleteLink ? handleDeleteLink : undefined}
          linkType={currentLinkAction.linkType || 'prueba'}
        />
      )}
    </>
  );
}; 

export default GroupedActions; 