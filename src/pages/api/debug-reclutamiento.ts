import { supabase } from '../../api/supabase';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  const { data, error } = await supabase
    .from('reclutamientos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'No encontrado', details: error?.message });
  }

  return res.status(200).json({ reclutamiento: data });
} 