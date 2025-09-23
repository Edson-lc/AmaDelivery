
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Minus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function MenuItemCard({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [customizations, setCustomizations] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // This effect handles initializing and resetting the state when the dialog is opened or closed.
    if (isDialogOpen) {
      // Pre-select the first option for mandatory groups when the dialog opens.
      const initialCustomizations = {};
      if (item.opcoes_personalizacao) {
        item.opcoes_personalizacao.forEach(group => {
          if (group.obrigatorio && group.opcoes && group.opcoes.length > 0) {
            initialCustomizations[group.nome_grupo] = group.opcoes[0].nome;
          }
        });
      }
      setCustomizations(initialCustomizations);
    } else {
      // Reset all temporary states when the dialog is closed.
      setQuantity(1);
      setObservacoes("");
      setRemovedIngredients([]);
      setSelectedExtras([]);
      setCustomizations({});
    }
  }, [isDialogOpen, item.opcoes_personalizacao]);

  const handleAddToCart = () => {
    // Check if all mandatory customization groups have an option selected
    if (item.opcoes_personalizacao) {
      for (const group of item.opcoes_personalizacao) {
        if (group.obrigatorio && !customizations[group.nome_grupo]) {
          alert(`Por favor, selecione uma opção para "${group.nome_grupo}".`);
          return; // Prevent adding to cart if mandatory option is missing
        }
      }
    }

    const cartItem = {
      ...item,
      quantidade: quantity,
      observacoes,
      ingredientes_removidos: removedIngredients,
      adicionais_selecionados: selectedExtras,
      personalizacoes: customizations
    };

    onAddToCart(cartItem, quantity, observacoes, selectedExtras);
    
    setIsDialogOpen(false); // This will trigger the useEffect to reset the state
  };

  const toggleIngredientRemoval = (ingredientName) => {
    setRemovedIngredients(prev => {
      if (prev.includes(ingredientName)) {
        return prev.filter(ing => ing !== ingredientName);
      } else {
        return [...prev, ingredientName];
      }
    });
  };

  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.nome === extra.nome);
      if (exists) {
        return prev.filter(e => e.nome !== extra.nome);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleCustomizationChange = (groupName, optionName) => {
    setCustomizations(prev => ({ ...prev, [groupName]: optionName }));
  };

  const getTotalPrice = () => {
    let total = item.preco;

    // Add price of selected extras
    selectedExtras.forEach(extra => {
      total += extra.preco;
    });

    // Add price of selected customizations
    if (item.opcoes_personalizacao) {
      item.opcoes_personalizacao.forEach(group => {
        const selectedOptionName = customizations[group.nome_grupo];
        if (selectedOptionName) {
          const selectedOption = group.opcoes.find(opt => opt.nome === selectedOptionName);
          if (selectedOption && selectedOption.preco_adicional) {
            total += selectedOption.preco_adicional;
          }
        }
      });
    }

    return total * quantity;
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild disabled={!item.disponivel}>
          <div className="w-full p-4 hover:bg-gray-50 cursor-pointer flex gap-4 text-left border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{item.nome}</h4>
                  {item.descricao && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.descricao}</p>
                  )}
                  
                  {item.ingredientes && item.ingredientes.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {item.ingredientes.slice(0, 4).map(ing => typeof ing === 'string' ? ing : ing.nome).join(", ")}
                      {item.ingredientes.length > 4 && "..."}
                    </p>
                  )}
                  
                  {item.alergenos && item.alergenos.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {item.alergenos.map(alergeno => (
                        <Badge key={alergeno} variant="outline" className="text-xs">
                          {alergeno}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="font-bold text-gray-900 mt-3">€{item.preco.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {item.imagem_url && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={item.imagem_url} 
                  alt={item.nome} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center">
              <Button size="icon" className="rounded-full bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{item.nome}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {item.imagem_url && (
              <img 
                src={item.imagem_url} 
                alt={item.nome} 
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}

            {item.descricao && (
              <p className="text-gray-600">{item.descricao}</p>
            )}
            
            {/* Grupos de Personalização */}
            {item.opcoes_personalizacao && item.opcoes_personalizacao.map((group, index) => (
                <div key={index} className="space-y-2">
                    <Separator />
                    <div className="flex justify-between items-center">
                        <Label className="font-semibold">{group.nome_grupo}</Label>
                        {group.obrigatorio && <Badge variant="outline">Obrigatório</Badge>}
                    </div>
                    <RadioGroup 
                        value={customizations[group.nome_grupo] || ""}
                        onValueChange={(value) => handleCustomizationChange(group.nome_grupo, value)}
                        required={group.obrigatorio}
                    >
                        {group.opcoes.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value={option.nome} id={`${group.nome_grupo}-${optIndex}`} />
                                    <Label htmlFor={`${group.nome_grupo}-${optIndex}`} className="cursor-pointer">{option.nome}</Label>
                                </div>
                                {option.preco_adicional > 0 && (
                                    <span className="text-sm text-gray-600">+ €{option.preco_adicional.toFixed(2)}</span>
                                )}
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ))}
            
            {/* Ingredientes Removíveis */}
            {item.ingredientes && item.ingredientes.filter(i => typeof i === 'object' && i.removivel).length > 0 && (
              <div className="space-y-2">
                <Separator />
                <Label className="font-semibold">Remover ingredientes</Label>
                {item.ingredientes.filter(i => typeof i === 'object' && i.removivel).map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox 
                      id={`remove-${index}`} 
                      checked={removedIngredients.includes(ingredient.nome)}
                      onCheckedChange={() => toggleIngredientRemoval(ingredient.nome)}
                    />
                    <Label htmlFor={`remove-${index}`} className="font-normal cursor-pointer">
                      Sem {ingredient.nome}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            {/* Adicionais */}
            {item.adicionais && item.adicionais.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Adicionais</h4>
                <div className="space-y-2">
                  {item.adicionais.map((adicional, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`extra-${index}`}
                          checked={selectedExtras.some(e => e.nome === adicional.nome)}
                          onCheckedChange={() => toggleExtra(adicional)}
                        />
                        <Label htmlFor={`extra-${index}`} className="text-sm">
                          {adicional.nome}
                        </Label>
                      </div>
                      <span className="text-sm font-medium">+€{adicional.preco.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações especiais</Label>
              <Textarea
                id="observacoes"
                placeholder="Ex: bem passado, sem sal, etc..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Separator />
            
            {/* Quantidade e Preço */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  €{getTotalPrice().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button onClick={handleAddToCart} className="w-full bg-orange-500 hover:bg-orange-600">
              Adicionar ao carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
