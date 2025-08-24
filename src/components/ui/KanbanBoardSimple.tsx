import React from 'react';
import { Typography, Card, Button, Badge, UserAvatar, Tooltip } from './index';
import { 
  PlusIcon, 
  MoreVerticalIcon,
  UserIcon,
  ClockIcon,
  AlertTriangleIcon,
  MessageIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from '../icons';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  tags?: string[];
  attachments?: number;
  comments?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: KanbanTask[];
  maxTasks?: number;
}

export interface KanbanBoardSimpleProps {
  columns: KanbanColumn[];
  onTaskClick?: (task: KanbanTask) => void;
  onTaskMove?: (taskId: string, fromStatus: string, toStatus: string) => void;
  className?: string;
}

const KanbanBoardSimple: React.FC<KanbanBoardSimpleProps> = ({
  columns,
  onTaskClick,
  onTaskMove,
  className = ''
}) => {
  // Obtener color de prioridad
  const getPriorityColor = (priority: KanbanTask['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority];
  };

  // Obtener icono de prioridad
  const getPriorityIcon = (priority: KanbanTask['priority']) => {
    return <AlertTriangleIcon className="w-3 h-3" />;
  };

  // Verificar si la tarea está vencida
  const isTaskOverdue = (task: KanbanTask) => {
    if (!task.dueDate) return false;
    return new Date() > task.dueDate;
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Renderizar tarea
  const renderTask = (task: KanbanTask, columnId: string) => {
    const isOverdue = isTaskOverdue(task);

    return (
      <Card
        key={task.id}
        variant="outlined"
        className={`
          mb-3 cursor-pointer transition-all duration-200
          hover: hover:border-primary/30
          ${isOverdue ? 'border-red-200 bg-red-50' : ''}
        `}
        onClick={() => onTaskClick?.(task)}
      >
        <div className="p-3 space-y-3">
          {/* Header de la tarea */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Typography variant="body2" weight="medium" className="mb-1 line-clamp-2">
                {task.title}
              </Typography>
              
              {task.description && (
                <Typography variant="caption" color="secondary" className="line-clamp-2">
                  {task.description}
                </Typography>
              )}
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getPriorityColor(task.priority)}`}
              >
                {getPriorityIcon(task.priority)}
                <span className="ml-1 capitalize">{task.priority}</span>
              </Badge>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVerticalIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Footer de la tarea */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              {/* Asignado */}
              {task.assignee ? (
                <Tooltip content={task.assignee.name}>
                  <div className="flex items-center space-x-1">
                    <UserAvatar
                      size="sm"
                      src={task.assignee.avatar}
                      fallbackText={task.assignee.name}
                    />
                    <Typography variant="caption" color="secondary">
                      {task.assignee.name}
                    </Typography>
                  </div>
                </Tooltip>
              ) : (
                <div className="flex items-center space-x-1 text-gray-400">
                  <UserIcon className="w-3 h-3" />
                  <Typography variant="caption">Sin asignar</Typography>
                </div>
              )}
              
              {/* Fecha de vencimiento */}
              {task.dueDate && (
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                  <ClockIcon className="w-3 h-3" />
                  <Typography variant="caption">
                    {formatDate(task.dueDate)}
                  </Typography>
                </div>
              )}
            </div>
            
            {/* Métricas */}
            <div className="flex items-center space-x-2">
              {task.attachments && task.attachments > 0 && (
                <div className="flex items-center space-x-1 text-gray-400">
                  <FileIcon className="w-3 h-3" />
                  <Typography variant="caption">{task.attachments}</Typography>
                </div>
              )}
              
              {task.comments && task.comments > 0 && (
                <div className="flex items-center space-x-1 text-gray-400">
                  <MessageIcon className="w-3 h-3" />
                  <Typography variant="caption">{task.comments}</Typography>
                </div>
              )}
            </div>
          </div>
          
          {/* Indicador de vencimiento */}
          {isOverdue && (
            <div className="flex items-center space-x-1 text-red-500">
              <AlertCircleIcon className="w-3 h-3" />
              <Typography variant="caption">Vencida</Typography>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Renderizar columna
  const renderColumn = (column: KanbanColumn) => {
    const taskCount = column.tasks.length;
    const isOverLimit = column.maxTasks && taskCount >= column.maxTasks;

    return (
      <div
        key={column.id}
        className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
      >
        {/* Header de la columna */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <Typography variant="subtitle1" weight="medium">
              {column.title}
            </Typography>
            
            <Badge variant="outline" className="text-xs">
              {taskCount}
              {column.maxTasks && `/${column.maxTasks}`}
            </Badge>
          </div>
        </div>
        
        {/* Lista de tareas */}
        <div className="space-y-2 min-h-[200px]">
          {column.tasks.map((task) => renderTask(task, column.id))}
          
          {/* Indicador de límite */}
          {isOverLimit && (
            <div className="text-center py-4 text-red-500">
              <Typography variant="caption">
                Límite de tareas alcanzado
              </Typography>
            </div>
          )}
          
          {/* Área de drop vacía */}
          {column.tasks.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Typography variant="body2" color="secondary">
                No hay tareas
              </Typography>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`group ${className}`}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map(renderColumn)}
      </div>
    </div>
  );
};

export default KanbanBoardSimple;
