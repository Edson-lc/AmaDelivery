
import React, { useState, useEffect, useCallback } from "react";
import { Order, Restaurant } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  RefreshCw, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import RestaurantOrderModal from "./RestaurantOrderModal";

const statusConfig = {
  pendente: { label: "Novo Pedido", color: "bg-red-100 text-red-800", priority: 1 },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800", priority: 2 },
  preparando: { label: "Preparando", color: "bg-orange-100 text-orange-800", priority: 3 },
  pronto: { label: "Pronto", color: "bg-purple-100 text-purple-800", priority: 4 },
  saiu_entrega: { label: "Saiu para Entrega", color: "bg-indigo-100 text-indigo-800", priority: 5 },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-800", priority: 6 },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-800", priority: 7 },
};

const nextStatusOptions = {
  pendente: [{ status: 'confirmado', label: 'Confirmar Pedido' }],
  confirmado: [{ status: 'preparando', label: 'Iniciar Preparo' }],
  preparando: [{ status: 'pronto', label: 'Marcar como Pronto' }],
  pronto: [], // Aguarda entregador
};

export default function RestaurantOrdersManager({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pendentes");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const restaurantOrders = await Order.filter({ restaurant_id: restaurantId }, '-created_date');
      setOrders(restaurantOrders);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    }
    setIsLoading(false);
  }, [restaurantId]);

  const filterOrders = useCallback(() => {
    let filtered = [...orders];

    // Filtro por tab
    if (activeTab === "pendentes") {
      filtered = filtered.filter(order => ['pendente', 'confirmado', 'preparando', 'pronto'].includes(order.status));
    } else if (activeTab === "entregues") {
      filtered = filtered.filter(order => order.status === 'entregue');
    } else if (activeTab === "cancelados") {
      filtered = filtered.filter(order => order.status === 'cancelado');
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm)
      );
    }

    // Ordenar por prioridade de status e data
    filtered.sort((a, b) => {
      const priorityA = statusConfig[a.status]?.priority || 999;
      const priorityB = statusConfig[b.status]?.priority || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return new Date(b.created_date) - new Date(a.created_date);
    });

    setFilteredOrders(filtered);
  }, [orders, activeTab, searchTerm]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, [loadOrders]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { 
        status: newStatus,
        [`data_${newStatus}`]: new Date().toISOString()
      });
      await loadOrders();
      
      // Se o modal estiver aberto, atualizar o pedido selecionado
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await Order.get(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days} dia(s) atrás`;
  };

  return (
    <>
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Gestão de Pedidos</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 max-w-xs"
                />
              </div>
              <Button onClick={loadOrders} disabled={isLoading} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100 mb-6">
              <TabsTrigger value="pendentes" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Em Andamento ({orders.filter(o => ['pendente', 'confirmado', 'preparando', 'pronto'].includes(o.status)).length})
              </TabsTrigger>
              <TabsTrigger value="entregues" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Entregues ({orders.filter(o => o.status === 'entregue').length})
              </TabsTrigger>
              <TabsTrigger value="cancelados" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Cancelados ({orders.filter(o => o.status === 'cancelado').length})
              </TabsTrigger>
            </TabsList>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan="7" className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="7" className="text-center py-8">
                        Nenhum pedido encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className={order.status === 'pendente' ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.cliente_nome}</p>
                            {order.cliente_telefone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                                onClick={() => window.open(`tel:${order.cliente_telefone}`)}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                {order.cliente_telefone}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.itens?.length || 0} itens</p>
                            {order.itens && order.itens.length > 0 && (
                              <p className="text-xs text-gray-500">{order.itens[0].nome}...</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">€{(order.total || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig[order.status]?.color || ''} border font-medium`}>
                            {statusConfig[order.status]?.label || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {getTimeAgo(order.created_date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {nextStatusOptions[order.status]?.map((action) => (
                              <Button
                                key={action.status}
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, action.status)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {isModalOpen && selectedOrder && (
        <RestaurantOrderModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
}
