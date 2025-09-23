
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, X } from 'lucide-react';

const categories = ["entrada", "prato_principal", "sobremesa", "bebida", "lanche", "acompanhamento"];

const DynamicFieldArray = ({ title, fields, setFields, fieldConfig }) => {
  const addField = () => {
    const newField = fieldConfig.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.default }), {});
    setFields([...fields, newField]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, fieldName, value) => {
    const newFields = [...fields];
    newFields[index][fieldName] = value;
    setFields(newFields);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h4 className="font-medium">{title}</h4>
      {fields.map((field, index) => (
        <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
          {fieldConfig.map(config => (
            <div key={config.name} className="flex-1">
              <Label className="text-xs">{config.label}</Label>
              {config.type === 'text' && (
                <Input
                  value={field[config.name] || ''}
                  onChange={(e) => handleFieldChange(index, config.name, e.target.value)}
                  placeholder={config.label}
                />
              )}
              {config.type === 'number' && (
                <Input
                  type="number"
                  step="0.01"
                  value={field[config.name] || 0}
                  onChange={(e) => handleFieldChange(index, config.name, parseFloat(e.target.value))}
                  placeholder={config.label}
                />
              )}
              {config.type === 'checkbox' && (
                <div className="flex items-center h-10">
                    <Checkbox
                        checked={field[config.name]}
                        onCheckedChange={(checked) => handleFieldChange(index, config.name, checked)}
                    />
                </div>
              )}
            </div>
          ))}
          <Button variant="ghost" size="icon" onClick={() => removeField(index)} className="mt-4">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addField}>
        <Plus className="w-4 h-4 mr-2" /> Adicionar
      </Button>
    </div>
  );
};


export default function MenuItemForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(item || {
      nome: "",
      descricao: "",
      preco: 0,
      categoria: "prato_principal",
      imagem_url: "",
      disponivel: true,
      ingredientes: [],
      adicionais: [],
      alergenos: [],
      opcoes_personalizacao: [], // Added for new feature
    });
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Transformar array de objetos de alergenos em array de strings
    const finalData = {
        ...formData,
        alergenos: (formData.alergenos || []).map(a => a.nome)
    };
    onSubmit(finalData);
  };

  if (!formData.nome === undefined) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Item *</Label>
          <Input id="nome" value={formData.nome || ''} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preco">Preço (€) *</Label>
          <Input id="preco" type="number" step="0.01" value={formData.preco || 0} onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value)})} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" value={formData.descricao || ''} onChange={(e) => setFormData({...formData, descricao: e.target.value})} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="imagem_url">URL da Imagem</Label>
          <Input id="imagem_url" value={formData.imagem_url || ''} onChange={(e) => setFormData({...formData, imagem_url: e.target.value})} />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <Label htmlFor="disponivel">Disponível para venda</Label>
        <Switch id="disponivel" checked={formData.disponivel} onCheckedChange={(checked) => setFormData({...formData, disponivel: checked})} />
      </div>
      
      {/* Ingredientes */}
      <DynamicFieldArray
        title="Ingredientes"
        fields={formData.ingredientes || []}
        setFields={(newFields) => setFormData({...formData, ingredientes: newFields})}
        fieldConfig={[
          { name: 'nome', label: 'Nome', type: 'text', default: '' },
          { name: 'removivel', label: 'Removível', type: 'checkbox', default: true },
        ]}
      />

      {/* Adicionais */}
      <DynamicFieldArray
        title="Adicionais Pagos"
        fields={formData.adicionais || []}
        setFields={(newFields) => setFormData({...formData, adicionais: newFields})}
        fieldConfig={[
          { name: 'nome', label: 'Nome', type: 'text', default: '' },
          { name: 'preco', label: 'Preço (€)', type: 'number', default: 0 },
        ]}
      />

      {/* Grupos de Personalização */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium">Grupos de Opções de Personalização</h4>
        {(formData.opcoes_personalizacao || []).map((group, groupIndex) => (
          <div key={groupIndex} className="p-3 border rounded-md space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold">Grupo {groupIndex + 1}</h5>
              <Button variant="ghost" size="icon" onClick={() => {
                const newGroups = [...formData.opcoes_personalizacao];
                newGroups.splice(groupIndex, 1);
                setFormData({...formData, opcoes_personalizacao: newGroups});
              }}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>Nome do Grupo (ex: Escolha a Carne)</Label>
                  <Input 
                    value={group.nome_grupo || ''} 
                    onChange={(e) => {
                      const newGroups = [...formData.opcoes_personalizacao];
                      newGroups[groupIndex].nome_grupo = e.target.value;
                      setFormData({...formData, opcoes_personalizacao: newGroups});
                    }}
                  />
                </div>
                <div className="flex items-end">
                    <div className="flex items-center gap-2 p-2 border rounded-md h-10">
                        <Checkbox 
                            id={`obrigatorio-${groupIndex}`}
                            checked={group.obrigatorio}
                            onCheckedChange={(checked) => {
                                const newGroups = [...formData.opcoes_personalizacao];
                                newGroups[groupIndex].obrigatorio = checked;
                                setFormData({...formData, opcoes_personalizacao: newGroups});
                            }}
                        />
                        <Label htmlFor={`obrigatorio-${groupIndex}`}>Seleção Obrigatória</Label>
                    </div>
                </div>
            </div>

            <div>
              <Label>Opções do Grupo</Label>
              {(group.opcoes || []).map((opcao, opcaoIndex) => (
                <div key={opcaoIndex} className="flex items-end gap-2 mt-2">
                  <div className="flex-1">
                    <Label className="text-xs">Nome da Opção</Label>
                    <Input 
                      value={opcao.nome || ''}
                      onChange={(e) => {
                        const newGroups = [...formData.opcoes_personalizacao];
                        newGroups[groupIndex].opcoes[opcaoIndex].nome = e.target.value;
                        setFormData({...formData, opcoes_personalizacao: newGroups});
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Preço Adicional (€)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={opcao.preco_adicional || 0}
                      onChange={(e) => {
                        const newGroups = [...formData.opcoes_personalizacao];
                        newGroups[groupIndex].opcoes[opcaoIndex].preco_adicional = parseFloat(e.target.value);
                        setFormData({...formData, opcoes_personalizacao: newGroups});
                      }}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => {
                     const newGroups = [...formData.opcoes_personalizacao];
                     newGroups[groupIndex].opcoes.splice(opcaoIndex, 1);
                     setFormData({...formData, opcoes_personalizacao: newGroups});
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => {
                const newGroups = [...formData.opcoes_personalizacao];
                if (!newGroups[groupIndex].opcoes) newGroups[groupIndex].opcoes = [];
                newGroups[groupIndex].opcoes.push({ nome: '', preco_adicional: 0 });
                setFormData({...formData, opcoes_personalizacao: newGroups});
              }}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Opção
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => {
          const newGroups = [...(formData.opcoes_personalizacao || [])];
          newGroups.push({ nome_grupo: '', obrigatorio: true, opcoes: [] });
          setFormData({...formData, opcoes_personalizacao: newGroups});
        }}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar Grupo de Opções
        </Button>
      </div>

      {/* Alergenos */}
      <DynamicFieldArray
        title="Alérgenos"
        fields={(formData.alergenos || []).map(a => ({ nome: a }))}
        setFields={(newFields) => setFormData({...formData, alergenos: newFields.map(f => f.nome)})}
        fieldConfig={[
          { name: 'nome', label: 'Nome do Alérgeno', type: 'text', default: '' },
        ]}
      />

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}><X className="w-4 h-4 mr-2" /> Cancelar</Button>
        <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500">Salvar Item</Button>
      </div>
    </form>
  );
}
