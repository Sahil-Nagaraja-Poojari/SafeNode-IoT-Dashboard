import { supabase } from './supabaseClient';
import { SafeNodeTelemetry } from './types';

export async function getLatestTelemetry(): Promise<SafeNodeTelemetry | null> {
  const { data, error } = await supabase
    .from('safenode_telemetry')
    .select('*')
    .eq('device_id', 'safenode-01')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Supabase telemetry error:', error);
    return null;
  }

  return data as SafeNodeTelemetry | null;
}

export async function getTelemetryHistory(
  limit = 30
): Promise<SafeNodeTelemetry[]> {
  const { data, error } = await supabase
    .from('safenode_telemetry')
    .select('*')
    .eq('device_id', 'safenode-01')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase history error:', error);
    return [];
  }

  return (data as SafeNodeTelemetry[]).reverse();
}