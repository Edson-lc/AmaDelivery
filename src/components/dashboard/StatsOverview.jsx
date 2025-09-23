import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingBag, 
  DollarSign, 
  Store, 
  TrendingUp 
} from "lucide-react";

export default function StatsOverview({ stats, isLoading }) {
  const statsCards = [
    {
      title: "Pedidos Hoje",
      value: stats.pedidosHoje,
      icon: ShoppingBag,
      color: "bg-blue-500",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Faturamento Hoje",
      value: `€ ${stats.faturamentoHoje.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      trend: "+8%",
      trendUp: true
    },
    {
      title: "Restaurantes Ativos",
      value: stats.restaurantesAtivos,
      icon: Store,
      color: "bg-purple-500",
      trend: "+2",
      trendUp: true
    },
    {
      title: "Total de Pedidos",
      value: stats.totalPedidos,
      icon: TrendingUp,
      color: "bg-pink-500",
      trend: "+156",
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <div className={`absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6 ${stat.color} rounded-full opacity-10`} />
          <CardHeader className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <CardTitle className="text-2xl md:text-3xl font-bold mt-2">
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    stat.value
                  )}
                </CardTitle>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className={`flex items-center font-medium ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${
                  stat.trendUp ? '' : 'rotate-180'
                }`} />
                {stat.trend}
              </span>
              <span className="text-gray-500 ml-2">vs ontem</span>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}