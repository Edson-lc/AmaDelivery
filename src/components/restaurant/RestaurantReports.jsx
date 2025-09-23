
import React, { useState, useEffect, useCallback } from "react";
import { Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Clock,
  Download
} from "lucide-react";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RestaurantReports({ restaurantId }) {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    completionRate: 0,
    dailyRevenue: [],
    topItems: [],
    ordersByHour: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Helper function for daily revenue, does not depend on state/props, so it's fine outside useCallback
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

      const orders = await Order.filter({ restaurant_id: restaurantId }, '-created_date');
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        // Ensure comparison includes the entire day
        return orderDate >= startOfDay(startDate) && orderDate <= endOfDay(endDate);
      });

      // Cálculos básicos
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const completedOrders = filteredOrders.filter(order => order.status === 'entregue').length;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      // Faturamento diário
      const dailyRevenue = generateDailyRevenue(filteredOrders, startDate, endDate);

      // Itens mais vendidos
      const itemCount = {};
      filteredOrders.forEach(order => {
        if (order.itens) {
          order.itens.forEach(item => {
            if (itemCount[item.nome]) {
              itemCount[item.nome].quantidade += item.quantidade;
              itemCount[item.nome].revenue += item.subtotal || (item.preco_unitario * item.quantidade);
            } else {
              itemCount[item.nome] = {
                nome: item.nome,
                quantidade: item.quantidade,
                revenue: item.subtotal || (item.preco_unitario * item.quantidade)
              };
            }
          });
        }
      });

      const topItems = Object.values(itemCount)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      // Pedidos por horário
      const hourlyOrders = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: filteredOrders.filter(order => {
          const orderHour = new Date(order.created_date).getHours();
          return orderHour === hour;
        }).length
      }));

      setReportData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        completionRate,
        dailyRevenue,
        topItems,
        ordersByHour: hourlyOrders
      });

    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
    setIsLoading(false);
  }, [restaurantId, dateRange]); // Dependencies for useCallback

  useEffect(() => {
    if (restaurantId) {
      loadReportData();
    }
  }, [restaurantId, loadReportData]); // Dependencies for useEffect

  const exportReport = () => {
    alert("Funcionalidade de exportação será implementada em breve!");
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Data */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Relatórios e Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Data Início</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Data Fim</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
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
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold text-green-600">€{reportData.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalOrders}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">€{reportData.averageOrderValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa Conclusão</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.completionRate.toFixed(1)}%</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Faturamento Diário */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Faturamento Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `€${value}`} />
                  <Tooltip formatter={(value) => [`€${value}`, 'Faturamento']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ea580c" 
                    strokeWidth={3} 
                    dot={{ fill: '#ea580c' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pedidos por Horário */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Pedidos por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.ordersByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#888888" 
                    fontSize={10}
                    interval={1}
                  />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#ea580c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens Mais Vendidos */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Itens Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.topItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum dado disponível no período selecionado</p>
          ) : (
            <div className="space-y-3">
              {reportData.topItems.map((item, index) => (
                <div key={item.nome} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-gray-600">{item.quantidade} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">€{item.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">faturamento</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
