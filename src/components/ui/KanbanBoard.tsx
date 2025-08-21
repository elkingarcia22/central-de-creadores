import React, { useState, useCallback, useRef } from 'react';
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

export interface KanbanBoardProps {
  /** Columnas del tablero */
  columns: KanbanColumn[];
  /** Callback cuando se mueve una tarea */
  onTaskMove?: (taskId: string, fromStatus: string, toStatus: string) => void;
  /** Callback cuando se hace click en una tarea */
  onTaskClick?: (task: KanbanTask) => void;
  /** Callback cuando se agrega una nueva tarea */
  onAddTask?: (status: string) => void;
  /** Callback cuando se edita una tarea */
  onEditTask?: (task: KanbanTask) => void;
  /** Callback cuando se elimina una tarea */
  onDeleteTask?: (taskId: string) => void;
  /** Callback cuando se cambia el orden de las columnas */
  onColumnReorder?: (columns: KanbanColumn[]) => void;
  /** Mostrar contador de tareas */
  showTaskCount?: boolean;
  /** Mostrar límite de tareas */
  showTaskLimit?: boolean;
  /** Permitir drag & drop */
  allowDragDrop?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  onTaskMove,
  onTaskClick,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onColumnReorder,
  showTaskCount = true,
  showTaskLimit = true,
  allowDragDrop = true,
  className = ''
}) => {
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [draggedOverTask, setDraggedOverTask] = useState<string | null>(null);

  // Obtener color de prioridad
  const getPriorityColor = useCallback((priority: KanbanTask['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority];
  }, []);

  // Obtener icono de prioridad
  const getPriorityIcon = useCallback((priority: KanbanTask['priority']) => {
    const icons = {
      low: <AlertTriangleIcon className="w-3 h-3" />,
      medium: <AlertTriangleIcon className="w-3 h-3" />,
      high: <AlertTriangleIcon className="w-3 h-3" />,
      urgent: <AlertTriangleIcon className="w-3 h-3" />
    };
    return icons[priority];
  }, []);

  // Verificar si la tarea está vencida
  const isTaskOverdue = useCallback((task: KanbanTask) => {
    if (!task.dueDate) return false;
    return new Date() > task.dueDate;
  }, []);

  // Formatear fecha
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Formatear tiempo relativo
  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    return `Hace ${Math.floor(days / 30)} meses`;
  }, []);

  // Drag & Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, task: KanbanTask) => {
    if (!allowDragDrop) return;
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id);
  }, [allowDragDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!allowDragDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [allowDragDrop]);

  const handleDragEnter = useCallback((e: React.DragEvent, columnId?: string, taskId?: string) => {
    if (!allowDragDrop) return;
    e.preventDefault();
    if (columnId) setDraggedOverColumn(columnId);
    if (taskId) setDraggedOverTask(taskId);
  }, [allowDragDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!allowDragDrop) return;
    e.preventDefault();
    setDraggedOverColumn(null);
    setDraggedOverTask(null);
  }, [allowDragDrop]);

  const handleDrop = useCallback((e: React.DragEvent, targetColumnId: string) => {
    if (!allowDragDrop || !draggedTask) return;
    e.preventDefault();
    
    const fromStatus = draggedTask.status;
    const toStatus = targetColumnId;
    
    if (fromStatus !== toStatus && onTaskMove) {
      onTaskMove(draggedTask.id, fromStatus, toStatus);
    }
    
    setDraggedTask(null);
    setDraggedOverColumn(null);
    setDraggedOverTask(null);
  }, [allowDragDrop, draggedTask, onTaskMove]);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
    setDraggedOverTask(null);
  }, []);

  // Renderizar tarea
  const renderTask = useCallback((task: KanbanTask, columnId: string) => {
    const isOverdue = isTaskOverdue(task);
    const isDragging = draggedTask?.id === task.id;
    const isDragOver = draggedOverTask === task.id;

    return (
      <Card
        key={task.id}
        variant="outlined"
        className={`
          mb-3 cursor-pointer transition-all duration-200
          hover:shadow-md hover:border-primary/30
          ${isDragging ? 'opacity-50' : ''}
          ${isDragOver ? 'border-primary bg-primary/5' : ''}
          ${isOverdue ? 'border-red-200 bg-red-50' : ''}
        `}
        draggable={allowDragDrop}
        onDragStart={(e) => handleDragStart(e, task)}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, columnId, task.id)}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
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
                  // Aquí se podría abrir un menú de opciones
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
  }, [
    isTaskOverdue,
    draggedTask,
    draggedOverTask,
    allowDragDrop,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    onTaskClick,
    getPriorityColor,
    getPriorityIcon,
    formatDate
  ]);

  // Renderizar columna
  const renderColumn = useCallback((column: KanbanColumn) => {
    const isDragOver = draggedOverColumn === column.id;
    const taskCount = column.tasks.length;
    const isOverLimit = column.maxTasks && taskCount >= column.maxTasks;

    return (
      <div
        key={column.id}
        className={`
          flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4
          ${isDragOver ? 'bg-primary/5 border-2 border-primary/30' : ''}
        `}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, column.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, column.id)}
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
            
            {showTaskCount && (
              <Badge variant="outline" className="text-xs">
                {taskCount}
                {column.maxTasks && `/${column.maxTasks}`}
              </Badge>
            )}
          </div>
          
          {onAddTask && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTask(column.id)}
              disabled={isOverLimit}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          )}
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
              {onAddTask && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTask(column.id)}
                  className="mt-2"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar tarea
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [
    draggedOverColumn,
    showTaskCount,
    onAddTask,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    renderTask
  ]);

  return (
    <div className={`group ${className}`}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map(renderColumn)}
      </div>
    </div>
  );
};

export default KanbanBoard;
