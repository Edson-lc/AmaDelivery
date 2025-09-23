import React, { useState, useEffect } from "react";
import { User, Restaurant, MenuItem, Order } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Eye,
  Edit,
  Plus,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import RestaurantOrdersManager from "../components/restaurant/RestaurantOrdersManager";
import RestaurantMenuManager from "../components/restaurant/RestaurantMenuManager";
import RestaurantReports from "../components/restaurant/RestaurantReports";

export default function RestaurantDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPedidosHoje: 0,
    faturamentoHoje: 0,
    pedidosAndamento: 0,
    itensCardapio: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        // Verificar se é usuário de restaurante
        if (user.tipo_usuario !== 'restaurante' && user.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        // Buscar dados do restaurante
        let restaurantData;
        if (user.restaurant_id) {
          restaurantData = await Restaurant.get(user.restaurant_id);
        } else if (user.role === 'admin') {
          // Para admin, mostrar o primeiro restaurante (ou permitir seleção)
          const restaurants = await Restaurant.list();
          restaurantData = restaurants[0];
        }

        if (!restaurantData) {
          alert("Restaurante não encontrado. Entre em contato com o suporte.");
          return;
        }

        setRestaurant(restaurantData);
        await loadDashboardData(restaurantData.id);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        window.location.href = createPageUrl('Home');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, []);

  const loadDashboardData = async (restaurantId) => {
    try {
      const [orders, menuItems] = await Promise.all([
        Order.filter({ restaurant_id: restaurantId }, '-created_date', 50),
        MenuItem.filter({ restaurant_id: restaurantId })
      ]);

      const hoje = new Date().toDateString();
      const pedidosHoje = orders.filter(order => 
        new Date(order.created_date).toDateString() === hoje
      );
      
      const faturamentoHoje = pedidosHoje.reduce((sum, order) => sum + (order.total || 0), 0);
      const pedidosAndamento = orders.filter(order => 
        ['confirmado', 'preparando', 'pronto'].includes(order.status)
      ).length;

      setStats({
        totalPedidosHoje: pedidosHoje.length,
        faturamentoHoje,
        pedidosAndamento,
        itensCardapio: menuItems.length
      });

      setRecentOrders(orders.slice(0, 10));

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={restaurant.imagem_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop"}
              alt={restaurant.nome}
              className="w-16 h-16 rounded-lg object-cover border-2 border-orange-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.nome}</h1>
              <p className="text-gray-600">Dashboard do Restaurante</p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedidos Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPedidosHoje}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faturamento Hoje</p>
                  <p className="text-2xl font-bold text-green-600">€{stats.faturamentoHoje.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pedidosAndamento}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Itens Cardápio</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.itensCardapio}</p>
                </div>
                <Store className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Cardápio
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pedidos Recentes */}
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum pedido encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                          <div>
                            <p className="font-medium">#{order.id.slice(-6)}</p>
                            <p className="text-sm text-gray-600">{order.cliente_nome}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(order.created_date), 'HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">€{order.total.toFixed(2)}</p>
                            <Badge variant="secondary">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status dos Pedidos */}
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Status dos Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: 'pendente', label: 'Pendentes', count: recentOrders.filter(o => o.status === 'pendente').length, color: 'bg-yellow-500' },
                      { status: 'confirmado', label: 'Confirmados', count: recentOrders.filter(o => o.status === 'confirmado').length, color: 'bg-blue-500' },
                      { status: 'preparando', label: 'Preparando', count: recentOrders.filter(o => o.status === 'preparando').length, color: 'bg-orange-500' },
                      { status: 'pronto', label: 'Prontos', count: recentOrders.filter(o => o.status === 'pronto').length, color: 'bg-purple-500' },
                      { status: 'entregue', label: 'Entregues', count: recentOrders.filter(o => o.status === 'entregue').length, color: 'bg-green-500' }
                    ].map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <RestaurantOrdersManager restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="menu">
            <RestaurantMenuManager restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="reports">
            <RestaurantReports restaurantId={restaurant.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}