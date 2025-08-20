import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 TEST SIMPLE: Iniciando prueba...');
    
    // 1. Obtener empresas con KAM IDs
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nombre, kam_id')
      .limit(3);
    
    console.log('🧪 TEST SIMPLE: Empresas:', empresas);
    console.log('🧪 TEST SIMPLE: Error empresas:', empresasError);

    if (!empresas || empresas.length === 0) {
      return res.status(200).json({ message: 'No hay empresas' });
    }

    // 2. Extraer KAM IDs únicos
    const kamIds = [...new Set(empresas.map(e => e.kam_id).filter(Boolean))];
    console.log('🧪 TEST SIMPLE: KAM IDs únicos:', kamIds);

    // 3. Consultar usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .in('id', kamIds);
    
    console.log('🧪 TEST SIMPLE: Usuarios encontrados:', usuarios);
    console.log('🧪 TEST SIMPLE: Error usuarios:', usuariosError);

    // 4. Crear mapa de KAMs
    const kamsMap = {};
    if (usuarios) {
      usuarios.forEach(usuario => {
        kamsMap[usuario.id] = usuario;
      });
    }
    console.log('🧪 TEST SIMPLE: Mapa de KAMs:', kamsMap);

    // 5. Mapear empresas con KAMs
    const empresasConKams = empresas.map(empresa => ({
      id: empresa.id,
      nombre: empresa.nombre,
      kam_id: empresa.kam_id,
      kam: empresa.kam_id ? kamsMap[empresa.kam_id] : null
    }));

    console.log('🧪 TEST SIMPLE: Empresas con KAMs:', empresasConKams);

    return res.status(200).json({
      empresas: empresasConKams,
      kamsMap: kamsMap,
      kamIds: kamIds
    });
  } catch (error) {
    console.error('🧪 TEST SIMPLE: Error:', error);
    return res.status(500).json({ error: 'Error en test' });
  }
}
