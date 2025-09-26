import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  CreditCard,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  pendente: { label: "Novo Pedido", color: "bg-red-100 text-red-800" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  preparando: { label: "Preparando", color: "bg-orange-100 text-orange-800" },
  pronto: { label: "Pronto", color: "bg-purple-100 text-purple-800" },
  saiu_entrega: { label: "Saiu para Entrega", color: "bg-indigo-100 text-indigo-800" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-800" }
};

const nextStatusOptions = {
  pendente: [{ status: "confirmado", label: "Confirmar Pedido", color: "bg-blue-600 hover:bg-blue-700" }],
  confirmado: [{ status: "preparando", label: "Iniciar Preparo", color: "bg-orange-600 hover:bg-orange-700" }],
  preparando: [{ status: "pronto", label: "Marcar como Pronto", color: "bg-purple-600 hover:bg-purple-700" }],
  pronto: [{ status: "saiu_entrega", label: "Saiu para Entrega", color: "bg-indigo-600 hover:bg-indigo-700" }],
  saiu_entrega: [{ status: "entregue", label: "Finalizar Entrega", color: "bg-green-600 hover:bg-green-700" }],
};

export default function RestaurantOrderModal({ order, onClose, onStatusUpdate }) {
  
  const formatAddress = (endereco) => {
    if (typeof endereco === 'string') return endereco;
    if (!endereco || typeof endereco !== 'object') return 'Endereço não informado';

    const { rua = '', numero = '', bairro = '', cidade = '' } = endereco;
    let addressString = '';
    if (rua) addressString += rua;
    if (numero) addressString += `, ${numero}`;
    if (bairro) addressString += ` - ${bairro}`;
    if (cidade && bairro !== cidade) addressString += `, ${cidade}`;

    return addressString || 'Endereço não informado';
  };

  const InfoLine = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Pedido #{String(order.id ?? "").slice(-6)}</span>
            <Badge className={`${statusConfig[order.status]?.color || ''} border font-medium`}>
              {statusConfig[order.status]?.label || order.status}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {format(new Date(order.created_date), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Cliente */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cliente
              </h3>
              <div className="space-y-3">
                <InfoLine 
                  icon={User} 
                  label="Nome" 
                  value={order.cliente_nome} 
                />
                <InfoLine 
                  icon={Phone} 
                  label="Telefone" 
                  value={
                    <div className="flex items-center gap-2">
                      <span>{order.cliente_telefone}</span>
                      {order.cliente_telefone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${order.cliente_telefone}`)}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Ligar
                        </Button>
                      )}
                    </div>
                  }
                />
                <InfoLine 
                  icon={MapPin} 
                  label="Endereço de Entrega" 
                  value={formatAddress(order.endereco_entrega)} 
                />
                <InfoLine 
                  icon={CreditCard} 
                  label="Forma de Pagamento" 
                  value={order.forma_pagamento || 'Não informado'} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Itens do Pedido */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">Itens do Pedido</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {order.itens?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.quantidade}x {item.nome}</p>
                      <p className="text-sm text-gray-600">€{item.preco_unitario?.toFixed(2)} cada</p>
                      {item.observacoes && (
                        <p className="text-sm text-orange-600 mt-1">
                          <span className="font-medium">Obs:</span> {item.observacoes}
                        </p>
                      )}
                      {item.adicionais && item.adicionais.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Adicionais:</span>
                          <ul className="list-disc list-inside ml-2">
                            {item.adicionais.map((adicional, idx) => (
                              <li key={idx}>{adicional.nome} (+€{adicional.preco?.toFixed(2)})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-lg">€{(item.subtotal || item.preco_unitario * item.quantidade).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span> 
                  <span className="font-medium">€{order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de Entrega:</span> 
                  <span className="font-medium">€{order.taxa_entrega?.toFixed(2) || '0.00'}</span>
                </div>
                {order.desconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto:</span> 
                    <span className="font-medium">-€{order.desconto?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span> 
                    <span>€{order.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {order.observacoes_cliente && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Observações do Cliente
                </h3>
                <p className="text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                  {order.observacoes_cliente}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">Ações</h3>
              <div className="flex flex-wrap gap-3">
                {nextStatusOptions[order.status]?.map((action) => (
                  <Button
                    key={action.status}
                    onClick={() => onStatusUpdate(order.id, action.status)}
                    className={`${action.color} text-white`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
                
                {order.status !== 'cancelado' && order.status !== 'entregue' && (
                  <Button
                    variant="destructive"
                    onClick={() => onStatusUpdate(order.id, 'cancelado')}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cancelar Pedido
                  </Button>
                )}

                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}