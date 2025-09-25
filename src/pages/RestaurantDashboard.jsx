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
  BarChart3,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import RestaurantOrdersManager from "../components/restaurant/RestaurantOrdersManager";
import RestaurantMenuManager from "../components/restaurant/RestaurantMenuManager";
import RestaurantReports from "../components/restaurant/RestaurantReports";
import RecentOrders from "@/components/dashboard/RecentOrders";
import RevenueChart from "@/components/dashboard/RevenueChart";

export default function RestaurantDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
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

        // Verificar se � usu�rio de restaurante
        if (user.tipo_usuario !== 'restaurante' && user.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        // Buscar dados do restaurante
        let restaurantData;
        if (user.restaurant_id) {
          restaurantData = await Restaurant.get(user.restaurant_id);
        } else if (user.role === 'admin') {
          // Para admin, mostrar o primeiro restaurante (ou permitir sele��o)
          const restaurants = await Restaurant.list();
          restaurantData = restaurants[0];
        }

        if (!restaurantData) {
          alert("Restaurante n�o encontrado. Entre em contato com o suporte.");
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-6 lg:p-8 antialiased touch-pan-y">
      <div className="max-w-7xl mx-auto">
        {/* Cabe�alho (alinhado ao dashboard admin) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-5">
            <img
              src={restaurant.imagem_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop"}
              alt={restaurant.nome}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover border-2 border-orange-200"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{restaurant.nome}</h1>
              <p className="text-gray-600 mt-0.5 md:mt-1">Dashboard do Restaurante</p>
              <p className="text-xs sm:text-sm text-orange-600 mt-0.5 md:mt-1">
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Estat�sticas (estilo dos cards do admin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {[ 
            { title: 'Pedidos Hoje', value: stats.totalPedidosHoje, Icon: ShoppingBag, color: 'bg-blue-500' },
            { title: 'Faturamento Hoje', value: '€ ' + stats.faturamentoHoje.toFixed(2), Icon: DollarSign, color: 'bg-green-500' },
            { title: 'Em Andamento', value: stats.pedidosAndamento, Icon: Clock, color: 'bg-orange-500' },
            { title: 'Itens Card\u00E1pio', value: stats.itensCardapio, Icon: Store, color: 'bg-purple-500' }
          ].map((s, i) => (
            <Card key={i} className="relative overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className={"absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 transform translate-x-6 -translate-y-6 " + s.color + " rounded-full opacity-10"} />
              <CardHeader className="p-5 md:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{s.title}</p>
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 md:mt-2">{s.value}</CardTitle>
                  </div>
                  <div className={"p-2.5 md:p-3 rounded-xl " + s.color + " bg-opacity-20"}>
                    <s.Icon className={s.color.replace('bg-', 'text-') + ' w-5 h-5 md:w-7 md:h-7'} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Conteúdo Principal (Tabs mantidas, estilo semelhante ao admin na visão geral) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-6 md:mt-8">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1 overflow-x-auto whitespace-nowrap -mx-2 px-2 md:mx-0 md:px-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 min-w-[140px] justify-center">
              <BarChart3 className="w-4 h-4" />
              {"Vis\u00E3o Geral"}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 min-w-[140px] justify-center">
              <ShoppingBag className="w-4 h-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2 min-w-[140px] justify-center">
              <Store className="w-4 h-4" />
              {"Card\u00E1pio"}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 min-w-[140px] justify-center">
              <TrendingUp className="w-4 h-4" />
              {"Relat\u00F3rios"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              <div className="space-y-5 md:space-y-6 lg:col-span-2">
                <RevenueChart />
                <div className="overflow-x-auto md:overflow-visible">
                  <RecentOrders orders={recentOrders.slice(0, 10)} isLoading={false} />
                </div>
              </div>
              <div className="space-y-6">
                {/* Status dos Pedidos */}
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Status dos Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 md:space-y-4">
                      {[
                        { status: 'pendente', label: 'Pendentes', count: recentOrders.filter(o => o.status === 'pendente').length, color: 'bg-yellow-500' },
                        { status: 'confirmado', label: 'Confirmados', count: recentOrders.filter(o => o.status === 'confirmado').length, color: 'bg-blue-500' },
                        { status: 'preparando', label: 'Preparando', count: recentOrders.filter(o => o.status === 'preparando').length, color: 'bg-orange-500' },
                        { status: 'pronto', label: 'Prontos', count: recentOrders.filter(o => o.status === 'pronto').length, color: 'bg-purple-500' },
                        { status: 'entregue', label: 'Entregues', count: recentOrders.filter(o => o.status === 'entregue').length, color: 'bg-green-500' }
                      ].map((item) => (
                        <div key={item.status} className="flex items-center justify-between p-3 md:p-4 bg-white/50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <div className={"w-2.5 h-2.5 md:w-3 md:h-3 rounded-full " + item.color}></div>
                            <span className="text-sm md:text-base font-medium">{item.label}</span>
                          </div>
                          <span className="text-sm md:text-base font-bold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
