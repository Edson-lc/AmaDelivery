import React, { useState, useEffect } from "react";
import { Restaurant, Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Store, 
  ShoppingBag, 
  DollarSign,
  Users,
  Clock,
  Star,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentOrders from "../components/dashboard/RecentOrders";
import TopRestaurants from "../components/dashboard/TopRestaurants";
import RevenueChart from "../components/dashboard/RevenueChart";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosHoje: 0,
    faturamentoHoje: 0,
    restaurantesAtivos: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [orders, restaurants] = await Promise.all([
        Order.list('-created_date', 50),
        Restaurant.list('-created_date'),
      ]);

      const hoje = new Date().toDateString();
      const pedidosHoje = orders.filter(order => 
        new Date(order.created_date).toDateString() === hoje
      );

      const faturamentoHoje = pedidosHoje.reduce((sum, order) => 
        sum + (order.total || 0), 0
      );

      const restaurantesAtivos = restaurants.filter(restaurant => 
        restaurant.status === 'ativo'
      ).length;
      
      setStats({
        totalPedidos: orders.length,
        pedidosHoje: pedidosHoje.length,
        faturamentoHoje,
        restaurantesAtivos,
      });

      setRecentOrders(orders.slice(0, 10));
      
      const restaurantRevenue = {};
      orders.forEach(order => {
        if (order.restaurant_id) {
          restaurantRevenue[order.restaurant_id] = (restaurantRevenue[order.restaurant_id] || 0) + (order.total || 0);
        }
      });
      
      const topRestaurantsData = restaurants
        .map(restaurant => ({
          ...restaurant,
          totalPedidos: orders.filter(o => o.restaurant_id === restaurant.id).length,
          faturamento: restaurantRevenue[restaurant.id] || 0
        }))
        .sort((a, b) => b.faturamento - a.faturamento)
        .slice(0, 5);

      setTopRestaurants(topRestaurantsData);

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Dashboard Principal
            </h1>
            <p className="text-gray-600 mt-2">
              Visão geral do seu negócio de delivery
            </p>
            <p className="text-sm text-orange-600 mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-orange-200 hover:bg-orange-50"
              onClick={loadDashboardData}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Atualizar Dados
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Relatório Completo
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <StatsOverview stats={stats} isLoading={isLoading} />

        {/* Conteúdo Principal */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <RevenueChart />
            <RecentOrders orders={recentOrders} isLoading={isLoading} />
          </div>

          <div className="space-y-6">
            <TopRestaurants restaurants={topRestaurants} isLoading={isLoading} />
          </div>
        </div>

        {/* Status Geral */}
        <div className="mt-8">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Sistema de Pedidos</p>
                    <p className="font-semibold text-green-700">
                      {stats.totalPedidos > 0 ? 'Operacional' : 'Aguardando Pedidos'}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                 <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Restaurantes Ativos</p>
                    <p className="font-semibold text-orange-700">{stats.restaurantesAtivos} ativos</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${stats.restaurantesAtivos > 0 ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}