import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Chip, 
  Badge, 
  Button, 
  Input, 
  Textarea, 
  Select,
  InfoContainer,
  InfoItem,
  Divider,
  Alert
} from '../ui';
import { 
  CheckCircleIcon, 
  AlertCircleIcon, 
  ClockIcon, 
  UserIcon, 
  DownloadIcon, 
  RefreshIcon,
  EditIcon,
  PlusIcon,
  XIcon
} from '../icons';

interface AnalyzeResultPanelV2Props {
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
  onReanalyze?: () => void;
  onCreateDolor?: (dolor: any) => void;
  onCreatePerfilamiento?: (perfil: any) => void;
  sessionId?: string;
}

export const AnalyzeResultPanelV2: React.FC<AnalyzeResultPanelV2Props> = ({
  result,
  meta,
  onClose,
  onEditDolor,
  onEditPerfil,
  onReanalyze,
  onCreateDolor,
  onCreatePerfilamiento,
  sessionId
}) => {
  const [editingDolor, setEditingDolor] = useState<number | null>(null);
  const [editingPerfil, setEditingPerfil] = useState<boolean>(false);
  const [dolorForm, setDolorForm] = useState({
    titulo: '',
    descripcion: '',
    severidad: 'media',
    ejemplo: ''
  });
  const [perfilForm, setPerfilForm] = useState({
    categoria: '',
    valor_principal: '',
    observaciones: '',
    contexto_interaccion: '',
    confianza_observacion: 'media',
    etiquetas_contexto: ''
  });

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'destructive';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  const getSeverityColor = (severidad: string) => {
    switch (severidad) {
      case 'alta': return 'destructive';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'secondary';
    }
  };

  const exportAnalysis = () => {
    const analysisData = {
      sessionId,
      timestamp: new Date().toISOString(),
      meta,
      result
    };
    
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-ia-sesion-${sessionId || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateDolor = (dolorIndex: number) => {
    const dolor = result.dolores[dolorIndex];
    setDolorForm({
      titulo: `Problema en ${dolor.categoria_id}`,
      descripcion: dolor.ejemplo,
      severidad: 'media',
      ejemplo: dolor.ejemplo
    });
    setEditingDolor(dolorIndex);
  };

  const handleSaveDolor = () => {
    if (onCreateDolor) {
      onCreateDolor({
        ...dolorForm,
        categoria_id: result.dolores[editingDolor!].categoria_id,
        evidence: result.dolores[editingDolor!].evidence
      });
    }
    setEditingDolor(null);
    setDolorForm({ titulo: '', descripcion: '', severidad: 'media', ejemplo: '' });
  };

  const handleCreatePerfilamiento = () => {
    if (result.perfil_sugerido) {
      setPerfilForm({
        categoria: result.perfil_sugerido.categoria_perfilamiento,
        valor_principal: result.perfil_sugerido.valor_principal,
        observaciones: result.perfil_sugerido.razones.join(', '),
        contexto_interaccion: 'Fragmento de transcripción donde se extrajo este perfilamiento',
        confianza_observacion: getConfidenceLabel(result.perfil_sugerido.confidence).toLowerCase(),
        etiquetas_contexto: 'feedback'
      });
      setEditingPerfil(true);
    }
  };

  const handleSavePerfilamiento = () => {
    if (onCreatePerfilamiento) {
      onCreatePerfilamiento(perfilForm);
    }
    setEditingPerfil(false);
    setPerfilForm({
      categoria: '',
      valor_principal: '',
      observaciones: '',
      contexto_interaccion: '',
      confianza_observacion: 'media',
      etiquetas_contexto: ''
    });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header con metadatos */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-white" />
            <div>
              <Typography variant="h3" weight="semibold" className="text-white">
                Análisis Completado
              </Typography>
              <Typography variant="body2" color="muted-foreground">
                Generado por {meta.provider} ({meta.model})
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onReanalyze && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReanalyze}
                className="flex items-center gap-2"
              >
                <RefreshIcon className="w-4 h-4" />
                Re-analizar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportAnalysis}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" />
              Exportar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 bg-gray-700 text-white">
            <ClockIcon className="w-3 h-3" />
            {formatLatency(meta.latencyMs)}
          </Badge>
          <Badge variant="secondary" className="bg-gray-700 text-white">
            {meta.provider}
          </Badge>
          {meta.fromCache && (
            <Badge variant="secondary" className="bg-gray-700 text-white">
              Desde caché
            </Badge>
          )}
        </div>
      </Card>

      {/* Resumen */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircleIcon className="w-4 h-4 text-white" />
          <Typography variant="h4" weight="semibold" className="text-white">
            Resumen Ejecutivo
          </Typography>
        </div>
        <Typography variant="body1" color="muted-foreground" className="leading-relaxed">
          {result.summary}
        </Typography>
      </Card>

      {/* Insights */}
      {result.insights && result.insights.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-4 h-4 text-white" />
            <Typography variant="h4" weight="semibold" className="text-white">
              Insights Identificados
            </Typography>
            <Badge variant="secondary" className="bg-gray-700 text-white">
              {result.insights.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {result.insights.slice(0, 5).map((insight, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
                <Typography variant="body2" className="mb-1">
                  {insight.text}
                </Typography>
                <Typography variant="caption" color="muted-foreground">
                  Evidencia: SEG.{insight.evidence.seg_id}
                </Typography>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dolores */}
      {result.dolores && result.dolores.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircleIcon className="w-4 h-4 text-white" />
            <Typography variant="h4" weight="semibold" className="text-white">
              Dolores Identificados
            </Typography>
            <Badge variant="secondary" className="bg-gray-700 text-white">
              {result.dolores.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {result.dolores.map((dolor, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                {editingDolor === index ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="body2" weight="medium" className="mb-2">
                          Título
                        </Typography>
                        <Input
                          value={dolorForm.titulo}
                          onChange={(e) => setDolorForm({...dolorForm, titulo: e.target.value})}
                          placeholder="Ej: Problemas en navegación"
                        />
                      </div>
                      <div>
                        <Typography variant="body2" weight="medium" className="mb-2">
                          Severidad
                        </Typography>
                        <Select
                          value={dolorForm.severidad}
                          onValueChange={(value) => setDolorForm({...dolorForm, severidad: value})}
                        >
                          <option value="baja">Baja</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Typography variant="body2" weight="medium" className="mb-2">
                        Descripción
                      </Typography>
                      <Textarea
                        value={dolorForm.descripcion}
                        onChange={(e) => setDolorForm({...dolorForm, descripcion: e.target.value})}
                        placeholder="Descripción detallada del dolor"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Typography variant="body2" weight="medium" className="mb-2">
                        Ejemplo
                      </Typography>
                      <Textarea
                        value={dolorForm.ejemplo}
                        onChange={(e) => setDolorForm({...dolorForm, ejemplo: e.target.value})}
                        placeholder="Ejemplo específico del participante"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveDolor} size="sm">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Crear Dolor
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingDolor(null)} 
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Typography variant="body2" weight="medium" className="mb-1">
                          Categoría: <Chip variant="destructive" size="sm">{dolor.categoria_id}</Chip>
                        </Typography>
                        <Typography variant="body2" color="muted-foreground" className="mb-2">
                          {dolor.ejemplo}
                        </Typography>
                        <Typography variant="caption" color="muted-foreground">
                          Evidencia: SEG.{dolor.evidence.seg_id}
                        </Typography>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateDolor(index)}
                        className="flex items-center gap-1"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Crear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Perfil Sugerido */}
      {result.perfil_sugerido && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-4 h-4 text-white" />
            <Typography variant="h4" weight="semibold" className="text-white">
              Perfilamiento Sugerido
            </Typography>
            <Badge variant={getConfidenceColor(result.perfil_sugerido.confidence)}>
              Confianza: {getConfidenceLabel(result.perfil_sugerido.confidence)}
            </Badge>
          </div>
          
          {editingPerfil ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">
                    Categoría
                  </Typography>
                  <Input
                    value={perfilForm.categoria}
                    onChange={(e) => setPerfilForm({...perfilForm, categoria: e.target.value})}
                    placeholder="Ej: Estilo de comunicación"
                  />
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">
                    Valor Principal
                  </Typography>
                  <Input
                    value={perfilForm.valor_principal}
                    onChange={(e) => setPerfilForm({...perfilForm, valor_principal: e.target.value})}
                    placeholder="Ej: Informal"
                  />
                </div>
              </div>
              <div>
                <Typography variant="body2" weight="medium" className="mb-2">
                  Observaciones
                </Typography>
                <Textarea
                  value={perfilForm.observaciones}
                  onChange={(e) => setPerfilForm({...perfilForm, observaciones: e.target.value})}
                  placeholder="El cliente suele ser muy informal al hablar pero directo"
                  rows={3}
                />
              </div>
              <div>
                <Typography variant="body2" weight="medium" className="mb-2">
                  Contexto de la Interacción
                </Typography>
                <Textarea
                  value={perfilForm.contexto_interaccion}
                  onChange={(e) => setPerfilForm({...perfilForm, contexto_interaccion: e.target.value})}
                  placeholder="Fragmento de la transcripción donde se extrajo este perfilamiento"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">
                    Confianza de la Observación
                  </Typography>
                  <Select
                    value={perfilForm.confianza_observacion}
                    onValueChange={(value) => setPerfilForm({...perfilForm, confianza_observacion: value})}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </Select>
                </div>
                <div>
                  <Typography variant="body2" weight="medium" className="mb-2">
                    Etiquetas de Contexto
                  </Typography>
                  <Input
                    value={perfilForm.etiquetas_contexto}
                    onChange={(e) => setPerfilForm({...perfilForm, etiquetas_contexto: e.target.value})}
                    placeholder="Ej: feedback"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSavePerfilamiento} size="sm">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Crear Perfilamiento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingPerfil(false)} 
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <InfoContainer className="mb-4">
                <InfoItem label="Categoría" value={result.perfil_sugerido.categoria_perfilamiento} />
                <InfoItem label="Valor Principal" value={result.perfil_sugerido.valor_principal} />
                <InfoItem 
                  label="Confianza" 
                  value={
                    <Badge variant={getConfidenceColor(result.perfil_sugerido.confidence)}>
                      {getConfidenceLabel(result.perfil_sugerido.confidence)}
                    </Badge>
                  } 
                />
              </InfoContainer>
              
              <div className="mb-4">
                <Typography variant="body2" weight="medium" className="mb-2">
                  Razones
                </Typography>
                <ul className="list-disc pl-5 space-y-1">
                  {result.perfil_sugerido.razones.map((razon, index) => (
                    <li key={index} className="text-muted-foreground">
                      {razon}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreatePerfilamiento}
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Crear Perfilamiento
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
