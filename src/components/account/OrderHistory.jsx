
import React, { useState, useEffect } from 'react';
import { Order, Cart, Restaurant } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, Eye, RefreshCw, MapPin, Clock, User, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import OrderDetailsModal from './OrderDetailsModal';

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

export default function OrderHistory({ userEmail }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!userEmail) return;
            setIsLoading(true);
            try {
                const userOrders = await Order.filter({ cliente_email: userEmail }, '-created_date');
                setOrders(userOrders);
            } catch (error) {
                console.error("Erro ao buscar histórico de pedidos:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [userEmail]);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleReorder = async (order) => {
        setIsReordering(true);
        try {
            // Buscar o restaurante para verificar se ainda está ativo
            const restaurant = await Restaurant.get(order.restaurant_id);
            
            if (!restaurant || restaurant.status !== 'ativo') {
                alert('Este restaurante não está mais disponível.');
                setIsReordering(false);
                return;
            }

            // Verificar se já existe um carrinho para este restaurante
            let existingCart = [];
            try {
                const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}`;
                localStorage.setItem('session_id', sessionId);
                existingCart = await Cart.filter({ 
                    session_id: sessionId, 
                    restaurant_id: order.restaurant_id 
                });
            } catch (error) {
                console.log("Nenhum carrinho existente encontrado");
            }

            // Preparar os itens do pedido para o carrinho
            const cartItems = order.itens.map(item => ({
                item_id: item.item_id,
                nome: item.nome,
                preco_unitario: item.preco_unitario,
                quantidade: item.quantidade,
                observacoes: item.observacoes || '',
                adicionais: item.adicionais || []
            }));

            const sessionId = localStorage.getItem('session_id');
            const subtotal = order.itens.reduce((sum, item) => sum + (item.subtotal || 0), 0);

            if (existingCart.length > 0) {
                // Atualizar carrinho existente
                const currentCart = existingCart[0];
                const updatedItems = [...(currentCart.itens || []), ...cartItems];
                const updatedSubtotal = currentCart.subtotal + subtotal;
                
                await Cart.update(currentCart.id, {
                    itens: updatedItems,
                    subtotal: updatedSubtotal,
                    data_atualizacao: new Date().toISOString()
                });
            } else {
                // Criar novo carrinho
                await Cart.create({
                    session_id: sessionId,
                    restaurant_id: order.restaurant_id,
                    itens: cartItems,
                    subtotal: subtotal,
                    data_criacao: new Date().toISOString(),
                    data_atualizacao: new Date().toISOString()
                });
            }

            // Redirecionar para o menu do restaurante
            window.location.href = createPageUrl(`RestaurantMenu?id=${order.restaurant_id}`);
            
        } catch (error) {
            console.error("Erro ao reordenar:", error);
            alert("Ocorreu um erro ao adicionar os itens ao carrinho. Tente novamente.");
        }
        setIsReordering(false);
    };

    return (
        <>
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Histórico de Pedidos</CardTitle>
                    <CardDescription>Veja todos os seus pedidos anteriores.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10">
                            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
                            <p className="mt-1 text-sm text-gray-500">Você ainda não fez nenhum pedido.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <Card key={order.id} className="p-4 hover:shadow-md transition-all cursor-pointer border border-gray-200">
                                    <div className="space-y-4">
                                        {/* Cabeçalho do pedido */}
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">Pedido #{order.id.slice(-6)}</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(order.created_date), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2">
                                                <Badge className={`${statusConfig[order.status]?.color || ''} border w-fit`}>
                                                    {statusConfig[order.status]?.label || order.status}
                                                </Badge>
                                                <p className="font-bold text-xl text-gray-900">€{(order.total || 0).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* Lista resumida dos itens */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            {order.itens && order.itens.slice(0, 2).map((item, idx) => (
                                                <p key={idx} className="text-sm text-gray-600">
                                                    {item.quantidade}x {item.nome}
                                                </p>
                                            ))}
                                            {order.itens && order.itens.length > 2 && (
                                                <p className="text-sm text-gray-500 italic">
                                                    ... e mais {order.itens.length - 2} {order.itens.length - 2 === 1 ? 'item' : 'itens'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Botão de ação - Apenas "Ver Detalhes" */}
                                        <div className="flex">
                                            <Button 
                                                variant="outline" 
                                                size="lg"
                                                className="w-full h-12 text-base font-medium touch-manipulation"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetails(order);
                                                }}
                                            >
                                                <Eye className="w-5 h-5 mr-2" />
                                                Ver Detalhes
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de detalhes */}
            {isModalOpen && selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setIsModalOpen(false)}
                    onReorder={handleReorder}
                    isReordering={isReordering}
                />
            )}
        </>
    );
}
