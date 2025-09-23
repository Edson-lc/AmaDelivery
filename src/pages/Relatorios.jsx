import React, { useState, useEffect, useCallback } from "react";
import { Restaurant, Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  ShoppingBag,
  Store,
  Users,
  Clock,
  Star,
  Filter,
  PieChart,
  LineChart
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLine, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Cell,
  Legend
} from "recharts";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

import RevenueAnalysis from "../components/reports/RevenueAnalysis";
import RestaurantRanking from "../components/reports/RestaurantRanking";

export default function RelatoriosPage() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeRestaurants: 0,
    topRestaurants: [],
    revenueByDay: [],
    ordersByStatus: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  const generateDailyRevenue = (orders, startDate, endDate) => {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        return orderDate.toDateString() === current.toDateString();
      });
      
      days.push({
        date: format(current, 'dd/MM'),
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        orders: dayOrders.length
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      const [orders, restaurants] = await Promise.all([
        Order.list('-created_date'),
        Restaurant.list('-created_date'),
      ]);

      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        return orderDate >= startDate && orderDate <= endDate;
      });

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const activeRestaurants = restaurants.filter(r => r.status === 'ativo').length;
      const revenueByDay = generateDailyRevenue(filteredOrders, startDate, endDate);
      
      const ordersByStatus = [
        { name: 'Entregues', value: filteredOrders.filter(o => o.status === 'entregue').length, color: '#10b981' },
        { name: 'Em Andamento', value: filteredOrders.filter(o => ['confirmado', 'preparando', 'pronto', 'saiu_entrega'].includes(o.status)).length, color: '#f59e0b' },
        { name: 'Cancelados', value: filteredOrders.filter(o => o.status === 'cancelado').length, color: '#ef4444' },
        { name: 'Pendentes', value: filteredOrders.filter(o => o.status === 'pendente').length, color: '#6b7280' }
      ];

      const restaurantOrders = {};
      filteredOrders.forEach(order => {
        restaurantOrders[order.restaurant_id] = (restaurantOrders[order.restaurant_id] || 0) + 1;
      });

      const topRestaurants = restaurants
        .map(restaurant => ({
          ...restaurant,
          orders: restaurantOrders[restaurant.id] || 0,
          revenue: filteredOrders
            .filter(o => o.restaurant_id === restaurant.id)
            .reduce((sum, o) => sum + (o.total || 0), 0)
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setReportData({
        totalRevenue,
        totalOrders: filteredOrders.length,
        activeRestaurants,
        topRestaurants,
        revenueByDay,
        ordersByStatus,
      });

    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
    setIsLoading(false);
  }, [dateRange]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const exportReport = () => {
    alert("Funcionalidade de exportação será implementada em breve!");
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
            <p className="text-gray-600 mt-2">
              Análise completa do desempenho do seu negócio
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Data Início</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data Fim</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
            <Button 
              onClick={exportReport}
              variant="outline" 
              className="border-orange-200 hover:bg-orange-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faturamento Total</p>
                  <p className="text-xl font-bold text-gray-900">€ {reportData.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pedidos</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.totalOrders}</p>
                </div>
                <ShoppingBag className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Restaurantes Ativos</p>
                  <p className="text-xl font-bold text-gray-900">{reportData.activeRestaurants}</p>
                </div>
                <Store className="w-6 h-6 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Faturamento
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Restaurantes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-orange-600" />
                    Faturamento Diário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLine data={reportData.revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `€${value}`} />
                        <Tooltip formatter={(value) => [`€ ${value}`, 'Faturamento']} />
                        <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} dot={{ fill: '#ea580c' }} />
                      </RechartsLine>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-orange-600" />
                    Status dos Pedidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie data={reportData.ordersByStatus} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                        {reportData.ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPie>
                      <Tooltip />
                      <Legend />
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueAnalysis data={reportData} />
          </TabsContent>

          <TabsContent value="restaurants">
            <RestaurantRanking restaurants={reportData.topRestaurants} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}