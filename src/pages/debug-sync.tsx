import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useFastUser } from '../contexts/FastUserContext';
import { Layout, Typography, Button, Card, Badge } from '../components/ui';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon, RefreshIcon } from '../components/icons';

interface SyncStatus {
  success: boolean;
  userId: string;
  analysis: {
    totalGoogleEvents: number;
    totalReclutamientos: number;
    hasGoogleTokens: boolean;
    googleEvents: any[];
    reclutamientos: any[];
  };
  problems: string[];
  summary: {
    googleCalendarConnected: boolean;
    totalReclutamientos: number;
    totalGoogleEvents: number;
    unsyncedReclutamientos: number;
    hasProblems: boolean;
  };
}

interface ForceSyncResult {
  success: boolean;
  message: string;
  total: number;
  synced: number;
  errors: number;
  results: any[];
}

interface DebugReclutamientoResult {
  success: boolean;
  reclutamiento: any;
  tokens: any;
  existingEvent: any;
  syncResult: any;
  debug: any;
  error?: string;
  details?: string;
}

interface VerifyReclutamientoResult {
  success: boolean;
  reclutamiento: any;
  access: any;
  existingEvent: any;
  debug: any;
  error?: string;
  details?: string;
}

const DebugSyncPage: NextPage = () => {
  const { userId, isAuthenticated } = useFastUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [forceSyncResult, setForceSyncResult] = useState<ForceSyncResult | null>(null);
  const [debugResult, setDebugResult] = useState<DebugReclutamientoResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyReclutamientoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSyncStatus = async () => {
    if (!userId) {
      setError('No se pudo obtener el userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/check-sync-status?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setSyncStatus(data);
      } else {
        setError(data.error || 'Error verificando estado de sincronización');
      }
    } catch (err) {
      setError('Error de conexión al verificar estado');
    } finally {
      setLoading(false);
    }
  };

  const forceSyncAll = async () => {
    if (!userId) {
      setError('No se pudo obtener el userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/force-sync-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setForceSyncResult(data);
        // Refrescar el estado después de la sincronización
        setTimeout(checkSyncStatus, 1000);
      } else {
        setError(data.error || 'Error en sincronización forzada');
      }
    } catch (err) {
      setError('Error de conexión en sincronización forzada');
    } finally {
      setLoading(false);
    }
  };

  const debugSpecificReclutamiento = async (reclutamientoId: string) => {
    if (!userId) {
      setError('No se pudo obtener el userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/debug-specific-reclutamiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, reclutamientoId }),
      });

      const data = await response.json();

      if (data.success) {
        setDebugResult(data);
      } else {
        setError(data.error || 'Error debuggeando reclutamiento');
      }
    } catch (err) {
      setError('Error de conexión al debuggear reclutamiento');
    } finally {
      setLoading(false);
    }
  };

  const verifyReclutamiento = async (reclutamientoId: string) => {
    if (!userId) {
      setError('No se pudo obtener el userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/verify-reclutamiento-exists?reclutamientoId=${reclutamientoId}&userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setVerifyResult(data);
      } else {
        setError(data.error || 'Error verificando reclutamiento');
      }
    } catch (err) {
      setError('Error de conexión al verificar reclutamiento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && isAuthenticated) {
      checkSyncStatus();
    }
  }, [userId, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="py-8">
          <div className="max-w-4xl mx-auto">
            <Typography variant="h1" className="mb-4">
              Debug de Sincronización
            </Typography>
            <Typography variant="body1" color="secondary">
              Debes estar autenticado para usar esta herramienta.
            </Typography>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <Typography variant="h1" className="mb-2">
              Debug de Sincronización Google Calendar
            </Typography>
            <Typography variant="body1" color="secondary">
              Herramienta para diagnosticar problemas de sincronización con Google Calendar
            </Typography>
          </div>

          {/* User Info */}
          <Card variant="elevated" padding="md">
            <Typography variant="h3" className="mb-4">
              Información del Usuario
            </Typography>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Typography variant="body2" className="font-medium">User ID:</Typography>
                <Typography variant="body2" className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {userId}
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <Typography variant="body2" className="font-medium">Estado:</Typography>
                <Badge variant={isAuthenticated ? 'success' : 'error'}>
                  {isAuthenticated ? 'Autenticado' : 'No autenticado'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card variant="elevated" padding="md">
            <Typography variant="h3" className="mb-4">
              Acciones
            </Typography>
            <div className="flex gap-4">
              <Button
                onClick={checkSyncStatus}
                disabled={loading}
                variant="outline"
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Verificar Estado
              </Button>
              <Button
                onClick={forceSyncAll}
                disabled={loading || !syncStatus?.summary.googleCalendarConnected}
                variant="primary"
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Forzar Sincronización
              </Button>
            </div>
          </Card>

          {/* Error */}
          {error && (
            <Card variant="elevated" padding="md" className="border-red-200 bg-red-50">
              <div className="flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <Typography variant="body1" className="text-red-800">
                  {error}
                </Typography>
              </div>
            </Card>
          )}

          {/* Loading */}
          {loading && (
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-center py-4">
                <RefreshIcon className="w-6 h-6 animate-spin mr-2" />
                <Typography variant="body1">
                  Procesando...
                </Typography>
              </div>
            </Card>
          )}

          {/* Sync Status */}
          {syncStatus && (
            <Card variant="elevated" padding="md">
              <Typography variant="h3" className="mb-4">
                Estado de Sincronización
              </Typography>
              
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Typography variant="h2" className="text-2xl font-bold">
                    {syncStatus.summary.totalReclutamientos}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Reclutamientos
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h2" className="text-2xl font-bold">
                    {syncStatus.summary.totalGoogleEvents}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    Eventos Google
                  </Typography>
                </div>
                <div className="text-center">
                  <Typography variant="h2" className="text-2xl font-bold">
                    {syncStatus.summary.unsyncedReclutamientos}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    No Sincronizados
                  </Typography>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    {syncStatus.summary.googleCalendarConnected ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <Typography variant="body2" color="secondary">
                    Google Calendar
                  </Typography>
                </div>
              </div>

              {/* Problems */}
              {syncStatus.problems.length > 0 && (
                <div className="mb-6">
                  <Typography variant="h4" className="mb-3">
                    Problemas Encontrados
                  </Typography>
                  <div className="space-y-2">
                    {syncStatus.problems.map((problem, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircleIcon className="w-4 h-4 text-red-600" />
                        <Typography variant="body2" className="text-red-800">
                          {problem}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reclutamientos */}
              <div>
                <Typography variant="h4" className="mb-3">
                  Reclutamientos
                </Typography>
                <div className="space-y-2">
                  {syncStatus.analysis.reclutamientos.map((reclutamiento) => (
                    <div key={reclutamiento.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Typography variant="body2" className="font-medium">
                          {reclutamiento.id}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {new Date(reclutamiento.fecha_sesion).toLocaleDateString()}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reclutamiento.hasGoogleEvent ? 'success' : 'error'}>
                          {reclutamiento.hasGoogleEvent ? 'Sincronizado' : 'No Sincronizado'}
                        </Badge>
                        {!reclutamiento.hasGoogleEvent && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verifyReclutamiento(reclutamiento.id)}
                              disabled={loading}
                            >
                              Verificar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => debugSpecificReclutamiento(reclutamiento.id)}
                              disabled={loading}
                            >
                              Debug
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Force Sync Result */}
          {forceSyncResult && (
            <Card variant="elevated" padding="md">
              <Typography variant="h3" className="mb-4">
                Resultado de Sincronización Forzada
              </Typography>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Typography variant="h2" className="text-2xl font-bold text-green-600">
                      {forceSyncResult.synced}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Sincronizados
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="h2" className="text-2xl font-bold text-red-600">
                      {forceSyncResult.errors}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Errores
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="h2" className="text-2xl font-bold">
                      {forceSyncResult.total}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      Total
                    </Typography>
                  </div>
                </div>
                
                <Typography variant="body1" className="text-center">
                  {forceSyncResult.message}
                </Typography>
              </div>
            </Card>
          )}

          {/* Debug Result */}
          {debugResult && (
            <Card variant="elevated" padding="md">
              <Typography variant="h3" className="mb-4">
                Resultado del Debug
              </Typography>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="h4" className="mb-2">Reclutamiento</Typography>
                    <div className="space-y-1 text-sm">
                      <div><strong>ID:</strong> {debugResult.reclutamiento.id}</div>
                      <div><strong>Fecha:</strong> {new Date(debugResult.reclutamiento.fecha_sesion).toLocaleDateString()}</div>
                      <div><strong>Duración:</strong> {debugResult.reclutamiento.duracion_sesion} min</div>
                      <div><strong>Meet Link:</strong> {debugResult.reclutamiento.meet_link || 'No'}</div>
                    </div>
                  </div>
                  <div>
                    <Typography variant="h4" className="mb-2">Tokens</Typography>
                    <div className="space-y-1 text-sm">
                      <div><strong>Access Token:</strong> {debugResult.tokens.accessToken}</div>
                      <div><strong>Refresh Token:</strong> {debugResult.tokens.refreshToken}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Typography variant="h4" className="mb-2">Debug Info</Typography>
                  <div className="space-y-1 text-sm">
                    <div><strong>Reclutamiento encontrado:</strong> {debugResult.debug.reclutamientoFound ? '✅' : '❌'}</div>
                    <div><strong>Tokens encontrados:</strong> {debugResult.debug.tokensFound ? '✅' : '❌'}</div>
                    <div><strong>Participante encontrado:</strong> {debugResult.debug.participanteFound ? '✅' : '❌'}</div>
                    <div><strong>Evento existente:</strong> {debugResult.debug.existingEventFound ? '✅' : '❌'}</div>
                  </div>
                </div>

                {debugResult.syncResult && (
                  <div>
                    <Typography variant="h4" className="mb-2">Resultado de Sincronización</Typography>
                    <div className="p-3 bg-muted rounded-lg">
                      <Typography variant="body2">
                        <strong>Éxito:</strong> {debugResult.syncResult.success ? '✅' : '❌'}
                      </Typography>
                      {debugResult.syncResult.reason && (
                        <Typography variant="body2">
                          <strong>Razón:</strong> {debugResult.syncResult.reason}
                        </Typography>
                      )}
                    </div>
                  </div>
                )}

                {debugResult.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Typography variant="body2" className="text-red-800">
                      <strong>Error:</strong> {debugResult.error}
                    </Typography>
                    {debugResult.details && (
                      <Typography variant="body2" className="text-red-800">
                        <strong>Detalles:</strong> {debugResult.details}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Verify Result */}
          {verifyResult && (
            <Card variant="elevated" padding="md">
              <Typography variant="h3" className="mb-4">
                Resultado de Verificación
              </Typography>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="h4" className="mb-2">Reclutamiento</Typography>
                    <div className="space-y-1 text-sm">
                      <div><strong>ID:</strong> {verifyResult.reclutamiento.id}</div>
                      <div><strong>Fecha:</strong> {new Date(verifyResult.reclutamiento.fecha_sesion).toLocaleDateString()}</div>
                      <div><strong>Duración:</strong> {verifyResult.reclutamiento.duracion_sesion} min</div>
                      <div><strong>Reclutador ID:</strong> {verifyResult.reclutamiento.reclutador_id}</div>
                      <div><strong>Participante ID:</strong> {verifyResult.reclutamiento.participantes_id || 'No'}</div>
                    </div>
                  </div>
                  <div>
                    <Typography variant="h4" className="mb-2">Acceso</Typography>
                    <div className="space-y-1 text-sm">
                      <div><strong>Tu User ID:</strong> {verifyResult.access.userId}</div>
                      <div><strong>Es Reclutador:</strong> {verifyResult.access.isReclutador ? '✅' : '❌'}</div>
                      <div><strong>Es Responsable:</strong> {verifyResult.access.isResponsable ? '✅' : '❌'}</div>
                      <div><strong>Es Implementador:</strong> {verifyResult.access.isImplementador ? '✅' : '❌'}</div>
                      <div><strong>Tiene Acceso:</strong> {verifyResult.access.hasAccess ? '✅' : '❌'}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Typography variant="h4" className="mb-2">Debug Info</Typography>
                  <div className="space-y-1 text-sm">
                    <div><strong>Reclutamiento encontrado:</strong> {verifyResult.debug.reclutamientoFound ? '✅' : '❌'}</div>
                    <div><strong>Participante encontrado:</strong> {verifyResult.debug.participanteFound ? '✅' : '❌'}</div>
                    <div><strong>Evento existente:</strong> {verifyResult.debug.existingEventFound ? '✅' : '❌'}</div>
                    <div><strong>User ID coincide:</strong> {verifyResult.debug.userIdMatches ? '✅' : '❌'}</div>
                  </div>
                </div>

                {verifyResult.existingEvent && (
                  <div>
                    <Typography variant="h4" className="mb-2">Evento Existente</Typography>
                    <div className="p-3 bg-muted rounded-lg">
                      <Typography variant="body2">
                        <strong>Google Event ID:</strong> {verifyResult.existingEvent.google_event_id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Estado:</strong> {verifyResult.existingEvent.sync_status}
                      </Typography>
                    </div>
                  </div>
                )}

                {verifyResult.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Typography variant="body2" className="text-red-800">
                      <strong>Error:</strong> {verifyResult.error}
                    </Typography>
                    {verifyResult.details && (
                      <Typography variant="body2" className="text-red-800">
                        <strong>Detalles:</strong> {verifyResult.details}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DebugSyncPage;