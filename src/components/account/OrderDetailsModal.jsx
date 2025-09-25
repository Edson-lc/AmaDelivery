import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, MapPin, Clock, User, Phone, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  pendente_pagamento: { label: "Aguardando Pagamento", color: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", color: "bg-blue-100 text-blue-800" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  preparando: { label: "Preparando", color: "bg-orange-100 text-orange-800" },
  pronto: { label: "Pronto", color: "bg-purple-100 text-purple-800" },
  saiu_entrega: { label: "Em Rota", color: "bg-indigo-100 text-indigo-800" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  rejeitado: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
};

const paymentMethodLabels = {
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  pix: "PIX",
  dinheiro: "Dinheiro",
  vale_refeicao: "Vale Refeição"
};

export default function OrderDetailsModal({ order, onClose, onReorder, isReordering }) {
    const formatAddress = (endereco) => {
        if (typeof endereco === 'string') return endereco;
        if (!endereco || typeof endereco !== 'object') return 'Endereço não informado';

        const { rua = '', numero = '', complemento = '', bairro = '', cidade = '' } = endereco;
        let addressString = '';
        if (rua) addressString += rua;
        if (numero) addressString += `, ${numero}`;
        if (complemento) addressString += ` - ${complemento}`;
        if (bairro) addressString += ` - ${bairro}`;
        if (cidade && bairro !== cidade) addressString += `, ${cidade}`;

        return addressString || 'Endereço não informado';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <Card className="border-none shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-xl">Detalhes do Pedido #{order.id.slice(-6)}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                {format(new Date(order.created_date), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={`${statusConfig[order.status]?.color || ''} border`}>
                                {statusConfig[order.status]?.label || order.status}
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Informações do Cliente */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Dados do Cliente
                            </h3>
                            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                                <p><strong>Nome:</strong> {order.cliente_nome}</p>
                                <p><strong>Telefone:</strong> {order.cliente_telefone}</p>
                                <p><strong>Email:</strong> {order.cliente_email}</p>
                            </div>
                        </div>

                        {/* Endereço de Entrega */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Endereço de Entrega
                            </h3>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p>{formatAddress(order.endereco_entrega)}</p>
                            </div>
                        </div>

                        {/* Itens do Pedido */}
                        <div>
                            <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                            <div className="space-y-3">
                                {order.itens && order.itens.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.quantidade}x {item.nome}</p>
                                            {item.observacoes && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <strong>Obs:</strong> {item.observacoes}
                                                </p>
                                            )}
                                            {item.adicionais && item.adicionais.length > 0 && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    <strong>Adicionais:</strong>
                                                    <ul className="ml-4">
                                                        {item.adicionais.map((adicional, addIdx) => (
                                                            <li key={addIdx}>• {adicional.nome} (+€{adicional.preco.toFixed(2)})</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">€{(item.subtotal || 0).toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">€{(item.preco_unitario || 0).toFixed(2)} cada</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resumo Financeiro */}
                        <div>
                            <h3 className="font-semibold mb-3">Resumo do Pagamento</h3>
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>€{(order.subtotal || 0).toFixed(2)}</span>
                                </div>
                                {order.taxa_entrega > 0 && (
                                    <div className="flex justify-between">
                                        <span>Taxa de Entrega:</span>
                                        <span>€{(order.taxa_entrega || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                {order.taxa_servico > 0 && (
                                    <div className="flex justify-between">
                                        <span>Taxa de Serviço:</span>
                                        <span>€{(order.taxa_servico || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                {order.desconto > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Desconto:</span>
                                        <span>-€{(order.desconto || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>€{(order.total || 0).toFixed(2)}</span>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                        <strong>Forma de Pagamento:</strong> {paymentMethodLabels[order.forma_pagamento] || order.forma_pagamento}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Observações */}
                        {order.observacoes_cliente && (
                            <div>
                                <h3 className="font-semibold mb-3">Observações do Cliente</h3>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p>{order.observacoes_cliente}</p>
                                </div>
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={onClose}>
                                Fechar
                            </Button>
                            {order.status === 'entregue' && (
                                <Button 
                                    className="bg-orange-500 hover:bg-orange-600"
                                    onClick={() => onReorder(order)}
                                    disabled={isReordering}
                                >
                                    {isReordering ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                    )}
                                    Pedir Novamente
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}