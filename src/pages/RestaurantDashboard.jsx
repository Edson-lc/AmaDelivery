import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Restaurant, MenuItem, Order } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, ShoppingBag, DollarSign, Clock, BarChart3, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import RestaurantOrdersManager from "../components/restaurant/RestaurantOrdersManager";
import RestaurantMenuManager from "../components/restaurant/RestaurantMenuManager";
import RestaurantReports from "../components/restaurant/RestaurantReports";
import RecentOrders from "@/components/dashboard/RecentOrders";
import RevenueChart from "@/components/dashboard/RevenueChart";

const VALID_TABS = new Set(["overview", "orders", "menu", "reports"]);

function resolveTab(searchParams) {
  const requestedTab = searchParams.get("tab")?.toLowerCase();
  return requestedTab && VALID_TABS.has(requestedTab) ? requestedTab : "overview";
}

export default function RestaurantDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => resolveTab(searchParams));
  const [stats, setStats] = useState({
    totalPedidosHoje: 0,
    faturamentoHoje: 0,
    pedidosAndamento: 0,
    itensCardapio: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const loadDashboardData = useCallback(async (restaurantId) => {
    try {
      const [orders, menuItems] = await Promise.all([
        Order.filter({ restaurant_id: restaurantId }, "-created_date", 50),
        MenuItem.filter({ restaurant_id: restaurantId }),
      ]);

      const hoje = new Date().toDateString();
      const pedidosHoje = orders.filter((order) => new Date(order.created_date).toDateString() === hoje);
      const faturamentoHoje = pedidosHoje.reduce((sum, order) => sum + (order.total || 0), 0);
      const pedidosAndamento = orders.filter((order) => ["confirmado", "preparando", "pronto"].includes(order.status)).length;

      setStats({
        totalPedidosHoje: pedidosHoje.length,
        faturamentoHoje,
        pedidosAndamento,
        itensCardapio: menuItems.length,
      });

      setRecentOrders(orders.slice(0, 10));
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const user = await User.me();

        if (user.tipo_usuario !== "restaurante" && user.role !== "admin") {
          window.location.href = createPageUrl("Home");
          return;
        }

        let restaurantData;
        if (user.restaurant_id) {
          restaurantData = await Restaurant.get(user.restaurant_id);
        } else if (user.role === "admin") {
          const restaurants = await Restaurant.list();
          restaurantData = restaurants?.[0];
        }

        if (!restaurantData) {
          alert("Restaurante não encontrado. Entre em contato com o suporte.");
          return;
        }

        setRestaurant(restaurantData);
        await loadDashboardData(restaurantData.id);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        window.location.href = createPageUrl("Home");
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [loadDashboardData]);

  useEffect(() => {
    const nextTab = resolveTab(searchParams);
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (nextValue) => {
    setActiveTab(nextValue);
    const params = new URLSearchParams(searchParams);
    if (nextValue === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", nextValue);
    }
    setSearchParams(params, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-6 text-center">
        <Card className="max-w-md border-none bg-white/90 p-8 shadow-lg backdrop-blur">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Não foi possível carregar o restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 space-y-2 p-0 text-gray-600">
            <p>Tente atualizar a página em alguns instantes. Caso o problema persista, contate o suporte.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 antialiased touch-pan-y md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="mb-6 flex flex-col items-start gap-4 md:mb-8 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-3 md:gap-5">
            <img
              src={
                restaurant.imagem_url ||
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop"
              }
              alt={restaurant.nome}
              className="h-14 w-14 rounded-lg border-2 border-orange-200 object-cover sm:h-16 sm:w-16 md:h-20 md:w-20"
            />
            <div>
              <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">{restaurant.nome}</h1>
              <p className="mt-0.5 text-gray-600 md:mt-1">Dashboard do Restaurante</p>
              <p className="mt-0.5 text-xs text-orange-600 md:mt-1">
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-5 lg:gap-6">
          {[
            { title: "Pedidos Hoje", value: stats.totalPedidosHoje, Icon: ShoppingBag, color: "bg-blue-500" },
            {
              title: "Faturamento Hoje",
              value: `€ ${stats.faturamentoHoje.toFixed(2)}`,
              Icon: DollarSign,
              color: "bg-green-500",
            },
            { title: "Em Andamento", value: stats.pedidosAndamento, Icon: Clock, color: "bg-orange-500" },
            { title: "Itens Cardápio", value: stats.itensCardapio, Icon: Store, color: "bg-purple-500" },
          ].map((summary) => (
            <Card
              key={summary.title}
              className="relative overflow-hidden border-none bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            >
              <div
                className={`absolute top-0 right-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full opacity-10 md:h-20 md:w-20 ${summary.color}`}
              />
              <CardHeader className="p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">{summary.title}</p>
                    <CardTitle className="mt-1 text-xl font-bold sm:text-2xl md:mt-2 md:text-3xl">{summary.value}</CardTitle>
                  </div>
                  <div className={`rounded-xl ${summary.color} bg-opacity-20 p-2.5 md:p-3`}>
                    <summary.Icon className={`${summary.color.replace("bg-", "text-")} h-5 w-5 md:h-7 md:w-7`} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Conteúdo Principal */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6 space-y-6 md:mt-8">
          <TabsList className="-mx-2 overflow-x-auto whitespace-nowrap bg-white/80 p-1 px-2 backdrop-blur-sm md:mx-0 md:px-1">
            <TabsTrigger value="overview" className="flex min-w-[140px] items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex min-w-[140px] items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex min-w-[140px] items-center justify-center gap-2">
              <Store className="h-4 w-4" />
              Cardápio
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex min-w-[140px] items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              <div className="space-y-5 md:space-y-6 lg:col-span-2">
                <RevenueChart />
                <div className="overflow-x-auto md:overflow-visible">
                  <RecentOrders orders={recentOrders.slice(0, 10)} isLoading={false} />
                </div>
              </div>
              <div className="space-y-6">
                <Card className="border-none bg-white/80 shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Status dos Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 md:space-y-4">
                      {[
                        { status: "pendente", label: "Pendentes", color: "bg-yellow-500" },
                        { status: "confirmado", label: "Confirmados", color: "bg-blue-500" },
                        { status: "preparando", label: "Preparando", color: "bg-orange-500" },
                        { status: "pronto", label: "Prontos", color: "bg-purple-500" },
                        { status: "entregue", label: "Entregues", color: "bg-green-500" },
                      ].map((item) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-white/50 p-3 md:p-4"
                        >
                          <div className="flex items-center gap-2.5 md:gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full md:h-3 md:w-3 ${item.color}`} />
                            <span className="text-sm font-medium md:text-base">{item.label}</span>
                          </div>
                          <span className="text-sm font-bold md:text-base">
                            {recentOrders.filter((order) => order.status === item.status).length}
                          </span>
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
