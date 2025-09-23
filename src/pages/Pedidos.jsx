import React, { useState, useEffect, useCallback } from "react";
import { Order, Restaurant } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import OrderDetailsModal from "../components/orders/OrderDetailsModal";

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparando: { label: "Preparando", color: "bg-orange-100 text-orange-800", icon: Clock },
  pronto: { label: "Pronto", color: "bg-purple-100 text-purple-800", icon: CheckCircle },
  saiu_entrega: { label: "Em Rota", color: "bg-indigo-100 text-indigo-800", icon: Truck },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orderData, restaurantData] = await Promise.all([
        Order.list('-created_date'),
        Restaurant.list(),
      ]);
      setOrders(orderData);
      setRestaurants(restaurantData.reduce((acc, r) => ({ ...acc, [r.id]: r }), {}));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterAndSortOrders = useCallback(() => {
    let newFilteredOrders = [...orders];

    if (activeTab !== "todos") {
      const statuses = {
        andamento: ["confirmado", "preparando", "pronto", "saiu_entrega"],
        finalizados: ["entregue"],
        problemas: ["cancelado"]
      }[activeTab];
      if (statuses) {
        newFilteredOrders = newFilteredOrders.filter(order => statuses.includes(order.status));
      }
    }

    if (searchTerm) {
      newFilteredOrders = newFilteredOrders.filter(order => {
        const restaurantName = restaurants[order.restaurant_id]?.nome || '';
        return order.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.includes(searchTerm);
      });
    }

    setFilteredOrders(newFilteredOrders);
  }, [orders, activeTab, searchTerm, restaurants]);

  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { status: newStatus });
      await loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await Order.get(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

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

  const StatCard = ({ title, value, icon: Icon }) => (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className="w-8 h-8 text-orange-500" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Pedidos</h1>
            <p className="text-gray-600 mt-2">Acompanhe e gerencie todos os pedidos da plataforma.</p>
          </div>
          <Button onClick={loadData} disabled={isLoading} variant="outline" className="border-orange-200 hover:bg-orange-50">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total de Pedidos" value={orders.length} icon={ShoppingBag} />
          <StatCard title="Em Andamento" value={orders.filter(o => ['confirmado', 'preparando', 'pronto', 'saiu_entrega'].includes(o.status)).length} icon={Clock} />
          <StatCard title="Entregues Hoje" value={orders.filter(o => o.status === 'entregue' && new Date(o.data_entrega).toDateString() === new Date().toDateString()).length} icon={CheckCircle} />
          <StatCard title="Cancelados" value={orders.filter(o => o.status === 'cancelado').length} icon={XCircle} />
        </div>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente, restaurante ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 max-w-lg"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 mb-4">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
                <TabsTrigger value="finalizados">Finalizados</TabsTrigger>
                <TabsTrigger value="problemas">Com Problemas</TabsTrigger>
              </TabsList>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Restaurante</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}><TableCell colSpan="7" className="text-center p-4">Carregando...</TableCell></TableRow>
                      ))
                    ) : filteredOrders.length > 0 ? (
                      filteredOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                          <TableCell>{order.cliente_nome}</TableCell>
                          <TableCell>{restaurants[order.restaurant_id]?.nome || 'N/A'}</TableCell>
                          <TableCell>{format(new Date(order.created_date), 'dd/MM/yy HH:mm', { locale: ptBR })}</TableCell>
                          <TableCell>€{(order.total || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig[order.status]?.color || ''} border font-medium`}>
                              {statusConfig[order.status]?.label || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="7" className="text-center h-24">Nenhum pedido encontrado.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {isModalOpen && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            restaurant={restaurants[selectedOrder.restaurant_id]}
            onClose={() => setIsModalOpen(false)}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </div>
    </div>
  );
}