import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, PageHeader } from '../../components/ui';
import Typography from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ArrowLeftIcon } from '../../components/icons';

export default function CrearParticipantePage() {
  const router = useRouter();
  const [tipo, setTipo] = useState('externo');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (router.query.tipo && typeof router.query.tipo === 'string') {
      setTipo(router.query.tipo);
    }
  }, [router.query.tipo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar creación de participante
    console.log('Creando participante:', { tipo, nombre, email });
    router.push('/participantes');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <PageHeader
              title={`Crear Participante - ${tipo}`}
              variant="compact"
              color="purple"
              className="mb-0"
            />
          </div>
        </div>

        <Card variant="elevated" padding="lg" className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Tipo: {tipo}
              </Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Nombre
              </Typography>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del participante"
                fullWidth
              />
            </div>

            <div>
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Email
              </Typography>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email del participante"
                fullWidth
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Crear Participante
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
