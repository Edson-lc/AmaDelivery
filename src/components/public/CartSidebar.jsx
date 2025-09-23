import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Clock, 
  X
} from "lucide-react";

export default function CartSidebar({ cart, restaurant, onRemoveItem, onClearCart, onCheckout, onUpdateQuantity }) {
  if (!cart || !cart.itens || cart.itens.length === 0) {
    return (
      <Card className="sticky top-6 border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <CardTitle className="text-gray-500">Seu carrinho está vazio</CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Adicione itens do cardápio para continuar
          </p>
        </CardHeader>
      </Card>
    );
  }

  const calculateItemTotal = (item) => {
    let total = item.preco_unitario * item.quantidade;
    
    // Adicionar preço dos adicionais
    if (item.adicionais_selecionados) {
      const adicionaisTotal = item.adicionais_selecionados.reduce((sum, add) => sum + (add.preco || 0), 0);
      total += adicionaisTotal * item.quantidade;
    }

    // Adicionar preço das personalizações
    if (item.personalizacoes && restaurant) {
      // Buscar no menu do restaurante o item original para calcular preços das personalizações
      // Por simplicidade, vamos assumir que as personalizações já estão no preço base
    }

    return total;
  };

  const total = cart.itens.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const taxaEntrega = restaurant?.taxa_entrega || 0;
  const totalFinal = total + taxaEntrega;

  return (
    <Card className="sticky top-6 border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-600" />
          O seu pedido
        </CardTitle>
        <p className="text-sm text-gray-600">{restaurant?.nome}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de Itens */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cart.itens.map((item, index) => (
            <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
              {/* Nome e quantidade */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onUpdateQuantity && onUpdateQuantity(index, Math.max(1, item.quantidade - 1))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium px-2">{item.quantidade}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onUpdateQuantity && onUpdateQuantity(index, item.quantidade + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-right ml-3">
                  <p className="font-semibold text-sm">€{calculateItemTotal(item).toFixed(2)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => onRemoveItem(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Personalizações */}
              {item.personalizacoes && Object.keys(item.personalizacoes).length > 0 && (
                <div className="text-xs text-gray-600 space-y-1">
                  {Object.entries(item.personalizacoes).map(([grupo, opcao]) => (
                    <div key={grupo} className="flex justify-between">
                      <span>• {grupo}:</span>
                      <span className="font-medium">{opcao}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionais */}
              {item.adicionais_selecionados && item.adicionais_selecionados.length > 0 && (
                <div className="text-xs text-gray-600 space-y-1 mt-1">
                  {item.adicionais_selecionados.map((adicional, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>+ {adicional.nome}</span>
                      <span>€{adicional.preco.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Ingredientes Removidos */}
              {item.ingredientes_removidos && item.ingredientes_removidos.length > 0 && (
                <div className="text-xs text-red-600 mt-1">
                  <span>Sem: {item.ingredientes_removidos.join(", ")}</span>
                </div>
              )}

              {/* Observações */}
              {item.observacoes && (
                <div className="text-xs text-gray-600 mt-1 italic">
                  Obs: {item.observacoes}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Resumo dos valores */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>€{total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Taxa de entrega</span>
            <span>€{taxaEntrega.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>€{totalFinal.toFixed(2)}</span>
          </div>
        </div>

        {/* Tempo estimado */}
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-orange-700">
            <Clock className="w-4 h-4" />
            <span>Entrega em {(restaurant?.tempo_preparo || 30) + 30} min</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-2">
          <Button 
            onClick={onCheckout}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
          >
            Finalizar Pedido • €{totalFinal.toFixed(2)}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCart}
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            Limpar Carrinho
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}