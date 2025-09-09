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

interface InvestigateResult {
  success: boolean;
  reclutamientoId: string;
  userId: string;
  analysis: any;
  estaEnListaUsuario: boolean;
  datos: any;
  errores: any;
}

const DebugSyncPage: NextPage = () => {
  const { userId, isAuthenticated } = useFastUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [forceSyncResult, setForceSyncResult] = useState<ForceSyncResult | null>(null);
  const [debugResult, setDebugResult] = useState<DebugReclutamientoResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyReclutamientoResult | null>(null);
  const [investigateResult, setInvestigateResult] = useState<InvestigateResult | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [verifyEventResult, setVerifyEventResult] = useState<any>(null);
  const [tableStructureResult, setTableStructureResult] = useState<any>(null);
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

  const investigateReclutamiento = async (reclutamientoId: string) => {
    if (!userId) {
      setError('No se pudo obtener el userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/investigate-reclutamiento-ghost?userId=${userId}&reclutamientoId=${reclutamientoId}`);
      const data = await response.json();

      if (data.success) {
        setInvestigateResult(data);
      } else {
        setError(data.error || 'Error investigando reclutamiento');
      }
    } catch (err) {
      setError('Error de conexión al investigar reclutamiento');
    } finally {
      setLoading(false);
    }
  };

  const syncSpecificReclutamiento = async (reclutamientoId: string) => {
    if (!userId) {
      setError('No se pudo obtener el userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sync-specific-reclutamiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reclutamientoId, userId })
      });
      
      const result = await response.json();
      setSyncResult(result);
      
      // Refrescar el estado después de sincronizar
      if (result.success) {
        setTimeout(() => {
          checkSyncStatus();
        }, 1000);
      }
    } catch (error) {
      setError('Error sincronizando reclutamiento');
    } finally {
      setLoading(false);
    }
  };

  const verifyGoogleCalendarEvent = async (reclutamientoId: string) => {
    if (!userId) {
      setError('No se pudo obtener el userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/verify-google-calendar-event?reclutamientoId=${reclutamientoId}&userId=${userId}`);
      const result = await response.json();
      setVerifyEventResult(result);
    } catch (error) {
      setError('Error verificando evento en Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const checkTableStructure = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/check-google-calendar-events-structure');
      const result = await response.json();
      setTableStructureResult(result);
    } catch (error) {
      setError('Error verificando estructura de la tabla');
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
              <Button
                onClick={checkTableStructure}
                disabled={loading}
                variant="outline"
              >
                Verificar Estructura Tabla
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
                              onClick={() => investigateReclutamiento(reclutamiento.id)}
                              disabled={loading}
                            >
                              Investigar
                            </Button>
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
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => syncSpecificReclutamiento(reclutamiento.id)}
                              disabled={loading}
                            >
                              Sincronizar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verifyGoogleCalendarEvent(reclutamiento.id)}
                              disabled={loading}
                            >
                              Verificar Evento
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

          {/* Sync Result */}
          {syncResult && (
            <Card variant="elevated" padding="md">
              <Typography variant="h3" className="mb-4">
                Resultado de Sincronización Específica
              </Typography>
              <div className="space-y-4">
                {syncResult.success ? (
                  <div className="text-center">
                    <Typography variant="h2" className="text-2xl font-bold text-green-600 mb-2">
                      ✅ Sincronización Exitosa
                    </Typography>
                    <Typography variant="body1" className="mb-4">
                      {syncResult.message}
                    </Typography>
                    {syncResult.reclutamiento && (
                      <div className="p-3 bg-muted rounded-lg">
                        <Typography variant="body2">
                          <strong>Reclutamiento:</strong> {syncResult.reclutamiento.id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Fecha:</strong> {new Date(syncResult.reclutamiento.fecha_sesion).toLocaleDateString()}
                        </Typography>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Typography variant="h2" className="text-2xl font-bold text-red-600 mb-2">
                      ❌ Error en Sincronización
                    </Typography>
                    <Typography variant="body1" className="mb-4">
                      {syncResult.error || 'Error desconocido'}
                    </Typography>
                    {syncResult.details && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Typography variant="body2" className="text-red-700 dark:text-red-300">
                          <strong>Detalles:</strong> {syncResult.details}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Verify Event Result */}
          {verifyEventResult && (
            <Card variant="elevated" padding="md">
              <Typography variant="h3" className="mb-4">
                Verificación de Evento en Google Calendar
              </Typography>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="h4" className="mb-2">Reclutamiento</Typography>
                    <div className="space-y-1 text-sm">
                      <div><strong>ID:</strong> {verifyEventResult.reclutamiento.id}</div>
                      <div><strong>Fecha:</strong> {new Date(verifyEventResult.reclutamiento.fecha_sesion).toLocaleDateString()}</div>
                      <div><strong>Duración:</strong> {verifyEventResult.reclutamiento.duracion_sesion} min</div>
                    </div>
                  </div>
                  <div>
                    <Typography variant="h4" className="mb-2">Google Calendar</Typography>
                    <div className="space-y-1 text-sm">
                      <div><strong>Total Eventos:</strong> {verifyEventResult.googleCalendar.totalEvents}</div>
                      <div><strong>Evento Encontrado:</strong> {verifyEventResult.googleCalendar.matchingEvent ? '✅ Sí' : '❌ No'}</div>
                    </div>
                  </div>
                </div>

                {verifyEventResult.googleCalendar.matchingEvent && (
                  <div>
                    <Typography variant="h4" className="mb-2">Evento Encontrado</Typography>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="space-y-1 text-sm">
                        <div><strong>ID:</strong> {verifyEventResult.googleCalendar.matchingEvent.id}</div>
                        <div><strong>Título:</strong> {verifyEventResult.googleCalendar.matchingEvent.summary}</div>
                        <div><strong>Inicio:</strong> {new Date(verifyEventResult.googleCalendar.matchingEvent.start.dateTime || verifyEventResult.googleCalendar.matchingEvent.start.date).toLocaleString()}</div>
                        <div><strong>Fin:</strong> {new Date(verifyEventResult.googleCalendar.matchingEvent.end.dateTime || verifyEventResult.googleCalendar.matchingEvent.end.date).toLocaleString()}</div>
                        {verifyEventResult.googleCalendar.matchingEvent.description && (
                          <div><strong>Descripción:</strong> {verifyEventResult.googleCalendar.matchingEvent.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {verifyEventResult.googleCalendar.allEvents.length > 0 && (
                  <div>
                    <Typography variant="h4" className="mb-2">Todos los Eventos del Día</Typography>
                    <div className="space-y-2">
                      {verifyEventResult.googleCalendar.allEvents.map((event: any, index: number) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          <div><strong>{event.summary || 'Sin título'}</strong></div>
                          <div>Inicio: {new Date(event.start.dateTime || event.start.date).toLocaleString()}</div>
                          <div>Fin: {new Date(event.end.dateTime || event.end.date).toLocaleString()}</div>
                        </div>
                      ))}
              </div>
            </div>
                )}

                {verifyEventResult.database.googleEvent && (
            <div>
                    <Typography variant="h4" className="mb-2">Registro en Base de Datos</Typography>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="space-y-1 text-sm">
                        <div><strong>ID:</strong> {verifyEventResult.database.googleEvent.id}</div>
                        <div><strong>Google Event ID:</strong> {verifyEventResult.database.googleEvent.google_event_id}</div>
                        <div><strong>Creado:</strong> {new Date(verifyEventResult.database.googleEvent.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Table Structure Result */}
          {tableStructureResult && (
            <Card variant="elevated" padding="md">
              <Typography variant="h3" className="mb-4">
                Estructura de la Tabla google_calendar_events
              </Typography>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="h4" className="mb-2">Información General</Typography>
                    <div className="space-y-1 text-sm">
                      <div><strong>Total Registros:</strong> {tableStructureResult.tableStructure.totalRecords}</div>
                      <div><strong>Tiene sesion_id:</strong> {tableStructureResult.tableStructure.hasSesionId ? '✅ Sí' : '❌ No'}</div>
                      <div><strong>Tiene reclutamiento_id:</strong> {tableStructureResult.tableStructure.hasReclutamientoId ? '✅ Sí' : '❌ No'}</div>
                    </div>
                  </div>
                  <div>
                    <Typography variant="h4" className="mb-2">Recomendación</Typography>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Typography variant="body2" className="text-blue-700 dark:text-blue-300">
                        {tableStructureResult.recommendation}
                      </Typography>
                    </div>
                  </div>
                </div>

                {tableStructureResult.tableStructure.sampleRecord && (
                  <div>
                    <Typography variant="h4" className="mb-2">Registro de Ejemplo</Typography>
                    <div className="p-3 bg-muted rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(tableStructureResult.tableStructure.sampleRecord, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {tableStructureResult.tableStructure.allRecords.length > 0 && (
                  <div>
                    <Typography variant="h4" className="mb-2">Todos los Registros</Typography>
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {tableStructureResult.tableStructure.allRecords.map((record: any, index: number) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          <div><strong>ID:</strong> {record.id}</div>
                          <div><strong>User ID:</strong> {record.user_id}</div>
                          <div><strong>Sesión ID:</strong> {record.sesion_id || 'N/A'}</div>
                          <div><strong>Reclutamiento ID:</strong> {record.reclutamiento_id || 'N/A'}</div>
                          <div><strong>Google Event ID:</strong> {record.google_event_id}</div>
                          <div><strong>Última Sincronización:</strong> {new Date(record.last_sync_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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