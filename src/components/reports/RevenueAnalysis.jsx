import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Target, Users } from "lucide-react";

export default function RevenueAnalysis({ data }) {
  const monthlyTargets = [
    { month: 'Jan', target: 15000, actual: 12500, orders: 450 },
    { month: 'Fev', target: 16000, actual: 18200, orders: 520 },
    { month: 'Mar', target: 17000, actual: 16800, orders: 490 },
    { month: 'Abr', target: 18000, actual: 21500, orders: 610 },
    { month: 'Mai', target: 19000, actual: 19200, orders: 580 },
    { month: 'Jun', target: 20000, actual: 22800, orders: 650 },
  ];

  return (
    <div className="space-y-6">
      {/* Métricas de Receita */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold text-green-600">€ 22.800</p>
                <p className="text-xs text-green-600 mt-1">+14% vs mês anterior</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-blue-600">€ 35.08</p>
                <p className="text-xs text-blue-600 mt-1">+3% vs mês anterior</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meta do Mês</p>
                <p className="text-2xl font-bold text-purple-600">114%</p>
                <p className="text-xs text-purple-600 mt-1">€ 2.800 acima da meta</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Únicos</p>
                <p className="text-2xl font-bold text-orange-600">1.247</p>
                <p className="text-xs text-orange-600 mt-1">+8% vs mês anterior</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Meta vs Realizado */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Meta vs Realizado - Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTargets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `€${value/1000}k`} />
                <Tooltip formatter={(value) => [`€ ${value}`, '']} />
                <Bar dataKey="target" fill="#d1d5db" name="Meta" />
                <Bar dataKey="actual" fill="#ea580c" name="Realizado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Categoria de Restaurante */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Hamburguer', revenue: 8500, percentage: 37, color: 'bg-red-500' },
                { category: 'Pizza', revenue: 6200, percentage: 27, color: 'bg-orange-500' },
                { category: 'Japonesa', revenue: 4800, percentage: 21, color: 'bg-yellow-500' },
                { category: 'Italiana', revenue: 2100, percentage: 9, color: 'bg-green-500' },
                { category: 'Outros', revenue: 1200, percentage: 6, color: 'bg-gray-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€ {item.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: 'Janeiro', growth: 5.2, amount: 1200 },
                { month: 'Fevereiro', growth: 12.8, amount: 2800 },
                { month: 'Março', growth: -2.1, amount: -450 },
                { month: 'Abril', growth: 18.5, amount: 3200 },
                { month: 'Maio', growth: 8.7, amount: 1800 },
                { month: 'Junho', growth: 15.2, amount: 3100 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${item.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.growth > 0 ? '+' : ''}{item.growth}%
                    </span>
                    <span className={`text-sm ${item.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      (€ {Math.abs(item.amount)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}