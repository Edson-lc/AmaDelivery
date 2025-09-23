import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import DriverLocationMap from './DriverLocationMap'; // Supondo que este componente exista

export default function DeliveryDriverDetails({ driver, onBack, onEdit }) {
  return (
    <div>
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para a lista
      </Button>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
                <img src={driver.foto_url} alt={driver.nome_completo} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-200" />
              <CardTitle className="text-center">{driver.nome_completo}</CardTitle>
              <CardDescription className="text-center">{driver.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => onEdit(driver)}>
                <Edit className="w-4 h-4 mr-2" /> Editar Perfil
              </Button>
            </CardContent>
          </Card>
          <Card>
              <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                  <p><strong>Telefone:</strong> {driver.telefone}</p>
                  <p><strong>NIF:</strong> {driver.nif}</p>
                  <p><strong>Endereço:</strong> {driver.endereco}</p>
              </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
            <Card className="h-96">
                <CardHeader><CardTitle>Localização em Tempo Real</CardTitle></CardHeader>
                <CardContent>
                   <DriverLocationMap driver={driver}/>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader><CardTitle>Estatísticas</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold">{driver.total_entregas}</p>
                        <p className="text-sm text-gray-500">Total de Entregas</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold">{driver.avaliacao.toFixed(1)}</p>
                        <p className="text-sm text-gray-500">Avaliação Média</p>
                    </div>
                 </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}