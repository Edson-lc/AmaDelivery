import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, X, UserPlus } from "lucide-react";

export default function EntregadorForm({ entregador, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(entregador || {
    nome_completo: "",
    email: "",
    telefone: "",
    status: "ativo",
    nif: "",
    data_nascimento: "",
    veiculo_tipo: "moto",
    veiculo_placa: "",
    iban: "",
    nome_banco: "",
    foto_url: "",
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      cep: ""
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value
      }
    }));
  };

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">
              {entregador ? 'Editar Entregador' : 'Adicionar Novo Entregador'}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {entregador ? 'Atualize as informações do entregador' : 'Crie um novo perfil de entregador'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input 
                  id="nome_completo" 
                  value={formData.nome_completo} 
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)} 
                  placeholder="Nome completo"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)} 
                  placeholder="email@exemplo.com"
                  required 
                  disabled={!!entregador} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  value={formData.telefone} 
                  onChange={(e) => handleInputChange('telefone', e.target.value)} 
                  placeholder="+351 999 999 999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input 
                  id="nif" 
                  value={formData.nif} 
                  onChange={(e) => handleInputChange('nif', e.target.value)} 
                  placeholder="123456789" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input 
                  id="data_nascimento" 
                  type="date" 
                  value={formData.data_nascimento} 
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="foto_url">URL da Foto</Label>
                <Input 
                  id="foto_url" 
                  value={formData.foto_url} 
                  onChange={(e) => handleInputChange('foto_url', e.target.value)} 
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="rua">Rua *</Label>
                <Input 
                  id="rua" 
                  value={formData.endereco?.rua || ''} 
                  onChange={(e) => handleAddressChange('rua', e.target.value)} 
                  placeholder="Nome da rua"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input 
                  id="numero" 
                  value={formData.endereco?.numero || ''} 
                  onChange={(e) => handleAddressChange('numero', e.target.value)} 
                  placeholder="123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input 
                  id="complemento" 
                  value={formData.endereco?.complemento || ''} 
                  onChange={(e) => handleAddressChange('complemento', e.target.value)} 
                  placeholder="Apt, Bloco, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input 
                  id="bairro" 
                  value={formData.endereco?.bairro || ''} 
                  onChange={(e) => handleAddressChange('bairro', e.target.value)} 
                  placeholder="Nome do bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input 
                  id="cidade" 
                  value={formData.endereco?.cidade || ''} 
                  onChange={(e) => handleAddressChange('cidade', e.target.value)} 
                  placeholder="Lisboa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cep">Código Postal</Label>
                <Input 
                  id="cep" 
                  value={formData.endereco?.cep || ''} 
                  onChange={(e) => handleAddressChange('cep', e.target.value)} 
                  placeholder="1000-000"
                />
              </div>
            </div>
          </div>

          {/* Veículo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações do Veículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veiculo_tipo">Tipo de Veículo</Label>
                <Select value={formData.veiculo_tipo} onValueChange={v => handleInputChange('veiculo_tipo', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pe">🚶 A pé</SelectItem>
                    <SelectItem value="bicicleta">🚲 Bicicleta</SelectItem>
                    <SelectItem value="moto">🏍️ Moto</SelectItem>
                    <SelectItem value="carro">🚗 Carro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="veiculo_placa">Placa do Veículo</Label>
                <Input 
                  id="veiculo_placa" 
                  value={formData.veiculo_placa} 
                  onChange={(e) => handleInputChange('veiculo_placa', e.target.value)} 
                  placeholder="XX-XX-XX"
                />
              </div>
            </div>
          </div>

          {/* Informações Bancárias */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Bancárias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_banco">Nome do Banco</Label>
                <Input 
                  id="nome_banco" 
                  value={formData.nome_banco} 
                  onChange={e => handleInputChange('nome_banco', e.target.value)} 
                  placeholder="Millennium BCP"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input 
                  id="iban" 
                  value={formData.iban} 
                  onChange={e => handleInputChange('iban', e.target.value)} 
                  placeholder="PT50 0000 0000 0000 0000 0000 0"
                />
              </div>
            </div>
          </div>

          {/* Configurações da Conta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Configurações da Conta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status da Conta</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                    <SelectItem value="inativo">⏸️ Inativo</SelectItem>
                    <SelectItem value="suspenso">🚫 Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              {entregador ? <Save className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {entregador ? 'Atualizar' : 'Adicionar'} Entregador
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}