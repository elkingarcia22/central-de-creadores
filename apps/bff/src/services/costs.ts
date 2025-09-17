import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface BudgetCheck {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  budget?: number;
  remaining?: number;
}

export interface CostRecord {
  tenantId: string;
  provider: string;
  costCents: number;
  meta?: any;
}

/**
 * Verifica si un tenant puede ejecutar una tarea basado en su presupuesto
 * @param tenantId - ID del tenant
 * @param estimatedCostCents - Costo estimado en centavos
 * @returns Resultado de la verificación de presupuesto
 */
export async function checkBudget(tenantId: string, estimatedCostCents: number): Promise<BudgetCheck> {
  try {
    // Obtener presupuesto del tenant (por ahora hardcodeado, en el futuro desde configuración)
    const monthlyBudget = 10000; // $100 por defecto
    const dailyBudget = 1000; // $10 por defecto

    // Obtener uso actual del mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyUsage, error: monthlyError } = await supabase
      .from('ai_costs')
      .select('cost_cents')
      .eq('tenant_id', tenantId)
      .gte('created_at', startOfMonth.toISOString());

    if (monthlyError) {
      console.error('Error checking monthly budget:', monthlyError);
      return { allowed: false, reason: 'budget_check_failed' };
    }

    const currentMonthlyUsage = monthlyUsage?.reduce((sum, record) => sum + Number(record.cost_cents), 0) || 0;

    // Verificar presupuesto mensual
    if (currentMonthlyUsage + estimatedCostCents > monthlyBudget) {
      return {
        allowed: false,
        reason: 'monthly_budget_exceeded',
        currentUsage: currentMonthlyUsage,
        budget: monthlyBudget,
        remaining: monthlyBudget - currentMonthlyUsage
      };
    }

    // Obtener uso actual del día
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: dailyUsage, error: dailyError } = await supabase
      .from('ai_costs')
      .select('cost_cents')
      .eq('tenant_id', tenantId)
      .gte('created_at', startOfDay.toISOString());

    if (dailyError) {
      console.error('Error checking daily budget:', dailyError);
      return { allowed: false, reason: 'budget_check_failed' };
    }

    const currentDailyUsage = dailyUsage?.reduce((sum, record) => sum + Number(record.cost_cents), 0) || 0;

    // Verificar presupuesto diario
    if (currentDailyUsage + estimatedCostCents > dailyBudget) {
      return {
        allowed: false,
        reason: 'daily_budget_exceeded',
        currentUsage: currentDailyUsage,
        budget: dailyBudget,
        remaining: dailyBudget - currentDailyUsage
      };
    }

    return {
      allowed: true,
      currentUsage: currentMonthlyUsage,
      budget: monthlyBudget,
      remaining: monthlyBudget - currentMonthlyUsage
    };

  } catch (error) {
    console.error('Error in checkBudget:', error);
    return { allowed: false, reason: 'budget_check_failed' };
  }
}

/**
 * Registra un costo en la base de datos
 * @param record - Información del costo a registrar
 */
export async function recordCost(record: CostRecord): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_costs')
      .insert({
        tenant_id: record.tenantId,
        provider: record.provider,
        cost_cents: record.costCents,
        meta: record.meta || {}
      });

    if (error) {
      console.error('Error recording cost:', error);
      throw new Error(`Failed to record cost: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in recordCost:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de costos para un tenant
 * @param tenantId - ID del tenant
 * @param period - Período ('day', 'month', 'year')
 * @returns Estadísticas de costos
 */
export async function getCostStats(tenantId: string, period: 'day' | 'month' | 'year' = 'month') {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const { data, error } = await supabase
      .from('ai_costs')
      .select('provider, cost_cents, created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString());

    if (error) {
      throw new Error(`Failed to get cost stats: ${error.message}`);
    }

    const totalCost = data?.reduce((sum, record) => sum + Number(record.cost_cents), 0) || 0;
    const byProvider = data?.reduce((acc, record) => {
      acc[record.provider] = (acc[record.provider] || 0) + Number(record.cost_cents);
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      period,
      totalCost,
      byProvider,
      recordCount: data?.length || 0
    };
  } catch (error) {
    console.error('Error in getCostStats:', error);
    throw error;
  }
}
