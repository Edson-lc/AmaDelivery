import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const mockData = [
  { dia: 'Seg', faturamento: 2400, pedidos: 24 },
  { dia: 'Ter', faturamento: 1398, pedidos: 18 },
  { dia: 'Qua', faturamento: 9800, pedidos: 52 },
  { dia: 'Qui', faturamento: 3908, pedidos: 31 },
  { dia: 'Sex', faturamento: 4800, pedidos: 44 },
  { dia: 'Sáb', faturamento: 3800, pedidos: 35 },
  { dia: 'Dom', faturamento: 4300, pedidos: 39 },
];

export default function RevenueChart() {
  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Faturamento da Semana
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">€ 32.408</p>
            <p className="text-sm text-green-600">+18% vs semana anterior</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="dia" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `€ ${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'faturamento' ? `€ ${value}` : `${value} pedidos`,
                  name === 'faturamento' ? 'Faturamento' : 'Pedidos'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="faturamento" 
                stroke="#ea580c" 
                strokeWidth={3}
                dot={{ fill: '#ea580c', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}