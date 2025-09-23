import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

export default function DeliveryDriverForm({ driver, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(driver || {
    nome_completo: '',
    email: '',
    telefone: '',
    status: 'ativo',
    veiculo_tipo: 'moto',
    // Preencha com outros campos
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <Button variant="outline" onClick={onCancel} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{driver ? 'Editar Entregador' : 'Novo Entregador'}</CardTitle>
          <CardDescription>Preencha as informações do entregador.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="nome_completo">Nome Completo</Label>
                    <Input id="nome_completo" value={formData.nome_completo} onChange={(e) => handleInputChange('nome_completo', e.target.value)} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={!!driver}/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={formData.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="suspenso">Suspenso</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}