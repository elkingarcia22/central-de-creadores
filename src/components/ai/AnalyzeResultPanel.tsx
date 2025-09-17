import React from 'react';
import { Card, Typography, Chip, Badge, Button } from '../ui';
import { CheckCircleIcon, AlertCircleIcon, ClockIcon, UserIcon } from '../icons';

interface AnalyzeResultPanelProps {
  result: {
    summary: string;
    insights: Array<{
      text: string;
      evidence: {
        seg_id: string;
      };
    }>;
    dolores: Array<{
      categoria_id: string;
      ejemplo: string;
      evidence: {
        seg_id: string;
      };
    }>;
    perfil_sugerido?: {
      categoria_perfilamiento: string;
      valor_principal: string;
      razones: string[];
      confidence: number;
    };
  };
  meta: {
    provider: string;
    model: string;
    latencyMs: number;
    costCents: number;
    fromCache: boolean;
  };
  onClose: () => void;
  onEditDolor?: (dolor: any) => void;
  onEditPerfil?: (perfil: any) => void;
}

export const AnalyzeResultPanel: React.FC<AnalyzeResultPanelProps> = ({
  result,
  meta,
  onClose,
  onEditDolor,
  onEditPerfil
}) => {
  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  return (
    <div className="space-y-6">
      {/* Header con metadatos */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <Typography variant="h3" weight="semibold">
              Análisis Completado
            </Typography>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <Badge variant="secondary">
            <ClockIcon className="w-3 h-3 mr-1" />
            {formatLatency(meta.latencyMs)}
          </Badge>
          <Badge variant="secondary">
            {meta.provider} ({meta.model})
          </Badge>
          {meta.fromCache && (
            <Badge variant="secondary">
              Desde caché
            </Badge>
          )}
        </div>
      </Card>

      {/* Resumen */}
      <Card className="p-4">
        <Typography variant="h4" weight="semibold" className="mb-3">
          Resumen del Análisis
        </Typography>
        <Typography variant="body1" className="text-gray-700 dark:text-gray-300">
          {result.summary}
        </Typography>
      </Card>

      {/* Insights */}
      {result.insights && result.insights.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-yellow-500" />
            <Typography variant="h4" weight="semibold">
              Insights Identificados
            </Typography>
            <Badge variant="secondary">
              {result.insights.length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {result.insights.map((insight, index) => (
              <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Typography variant="body2" className="text-gray-800 dark:text-gray-200">
                  {insight.text}
                </Typography>
                <div className="mt-2">
                  <Chip variant="outline" size="sm">
                    Ver minuto: {insight.evidence.seg_id}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dolores Identificados */}
      {result.dolores && result.dolores.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircleIcon className="w-5 h-5 text-red-500" />
            <Typography variant="h4" weight="semibold">
              Dolores Identificados
            </Typography>
            <Badge variant="danger">
              {result.dolores.length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {result.dolores.map((dolor, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Typography variant="body2" weight="medium" className="text-gray-800 dark:text-gray-200 mb-1">
                      {dolor.categoria_id}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      {dolor.ejemplo}
                    </Typography>
                    <div className="mt-2">
                      <Chip variant="outline" size="sm">
                        Ver minuto: {dolor.evidence.seg_id}
                      </Chip>
                    </div>
                  </div>
                  {onEditDolor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditDolor(dolor)}
                      className="ml-2"
                    >
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Perfil Sugerido */}
      {result.perfil_sugerido && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="w-5 h-5 text-blue-500" />
            <Typography variant="h4" weight="semibold">
              Perfil Sugerido
            </Typography>
            <Badge 
              variant={getConfidenceColor(result.perfil_sugerido.confidence)}
            >
              Confianza: {getConfidenceLabel(result.perfil_sugerido.confidence)}
            </Badge>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Chip variant="primary">
                    {result.perfil_sugerido.categoria_perfilamiento}
                  </Chip>
                  <Chip variant="secondary">
                    {result.perfil_sugerido.valor_principal}
                  </Chip>
                </div>
                
                <Typography variant="body2" weight="medium" className="mb-2">
                  Razones:
                </Typography>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {result.perfil_sugerido.razones.map((razon, index) => (
                    <li key={index}>{razon}</li>
                  ))}
                </ul>
              </div>
              
              {onEditPerfil && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPerfil(result.perfil_sugerido)}
                  className="ml-2"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="primary">
          Guardar Análisis
        </Button>
      </div>
    </div>
  );
};
