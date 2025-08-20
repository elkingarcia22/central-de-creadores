import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/ui';
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
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver
          </Button>
          <Typography variant="h2" weight="bold">
            Crear Participante - {tipo}
          </Typography>
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
