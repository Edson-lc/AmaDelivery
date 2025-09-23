import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, X } from "lucide-react";

const categories = [
  "brasileira", "italiana", "japonesa", "chinesa", "arabe",
  "mexicana", "hamburguer", "pizza", "saudavel", "sobremesas", "lanches", "outros"
];

export default function RestaurantForm({ restaurant, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(restaurant || {
    nome: "",
    descricao: "",
    categoria: "brasileira",
    endereco: "",
    telefone: "",
    email: "",
    tempo_preparo: 30,
    taxa_entrega: 5.00,
    valor_minimo: 20.00,
    status: "ativo",
    avaliacao: 0,
    imagem_url: ""
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
              {restaurant ? 'Editar Restaurante' : 'Novo Restaurante'}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Preencha as informações do restaurante parceiro
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informações Básicas</h3>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Restaurante *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Nome do restaurante"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleInputChange('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descrição do restaurante"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagem_url">URL da Imagem</Label>
                <Input
                  id="imagem_url"
                  value={formData.imagem_url}
                  onChange={(e) => handleInputChange('imagem_url', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            {/* Contato e Localização */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Contato e Localização</h3>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Textarea
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Endereço completo do restaurante"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@restaurante.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Configurações Operacionais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Configurações Operacionais</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tempo_preparo">Tempo de Preparo (min)</Label>
                <Input
                  id="tempo_preparo"
                  type="number"
                  value={formData.tempo_preparo}
                  onChange={(e) => handleInputChange('tempo_preparo', parseInt(e.target.value))}
                  placeholder="30"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxa_entrega">Taxa de Entrega (€)</Label>
                <Input
                  id="taxa_entrega"
                  type="number"
                  step="0.01"
                  value={formData.taxa_entrega}
                  onChange={(e) => handleInputChange('taxa_entrega', parseFloat(e.target.value))}
                  placeholder="5.00"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_minimo">Valor Mínimo (€)</Label>
                <Input
                  id="valor_minimo"
                  type="number"
                  step="0.01"
                  value={formData.valor_minimo}
                  onChange={(e) => handleInputChange('valor_minimo', parseFloat(e.target.value))}
                  placeholder="20.00"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {restaurant ? 'Atualizar' : 'Salvar'} Restaurante
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}