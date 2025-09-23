import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, DollarSign, ShoppingBag } from "lucide-react";

export default function RestaurantRanking({ restaurants }) {
  const categoryPerformance = [
    { category: 'Hamburguer', restaurants: 8, avgRating: 4.2, totalOrders: 856, revenue: 18500 },
    { category: 'Pizza', restaurants: 12, avgRating: 4.5, totalOrders: 642, revenue: 15200 },
    { category: 'Japonesa', restaurants: 6, avgRating: 4.7, totalOrders: 423, revenue: 12800 },
    { category: 'Italiana', restaurants: 9, avgRating: 4.3, totalOrders: 325, revenue: 9600 },
    { category: 'Brasileira', restaurants: 5, avgRating: 4.1, totalOrders: 287, revenue: 7200 }
  ];

  return (
    <div className="space-y-6">
      {/* Performance por Categoria */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Performance por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-2 font-medium">Categoria</th>
                  <th className="text-center p-2 font-medium">Restaurantes</th>
                  <th className="text-center p-2 font-medium">Avaliação Média</th>
                  <th className="text-center p-2 font-medium">Total Pedidos</th>
                  <th className="text-center p-2 font-medium">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="font-medium">{category.category}</span>
                      </div>
                    </td>
                    <td className="text-center p-3">{category.restaurants}</td>
                    <td className="text-center p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{category.avgRating}</span>
                      </div>
                    </td>
                    <td className="text-center p-3 font-medium">{category.totalOrders}</td>
                    <td className="text-center p-3">
                      <span className="font-bold text-green-600">€ {category.revenue.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 10 Restaurantes */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Top 10 Restaurantes por Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {restaurants.slice(0, 10).map((restaurant, index) => (
                <div key={restaurant.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index < 3 ? 
                        ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600'][index] : 
                        'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{restaurant.nome}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {restaurant.categoria}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{restaurant.avaliacao?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">€ {restaurant.revenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">{restaurant.orders || 0} pedidos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crescimento dos Restaurantes */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Restaurantes com Maior Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Burger Palace', growth: 25.8, orders: 142, category: 'Hamburguer' },
                { name: 'Sushi Express', growth: 18.2, orders: 98, category: 'Japonesa' },
                { name: 'Pizza Napoli', growth: 15.7, orders: 156, category: 'Pizza' },
                { name: 'Pasta Italiana', growth: 12.4, orders: 89, category: 'Italiana' },
                { name: 'Taco Loco', growth: 11.9, orders: 67, category: 'Mexicana' },
                { name: 'Healthy Bowl', growth: 8.3, orders: 45, category: 'Saudavel' }
              ].map((restaurant, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-gray-600">{restaurant.category} • {restaurant.orders} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{restaurant.growth}%</p>
                    <p className="text-xs text-gray-500">vs mês anterior</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurantes que Precisam de Atenção */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-600">Restaurantes que Precisam de Atenção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Fast Food Center', issue: 'Avaliação baixa (3.2)', action: 'Melhorar qualidade', severity: 'high' },
              { name: 'Comida Caseira', issue: 'Tempo de preparo alto (45 min)', action: 'Otimizar processos', severity: 'medium' },
              { name: 'Lanchonete da Esquina', issue: 'Queda de pedidos (-15%)', action: 'Revisar cardápio/preços', severity: 'high' },
              { name: 'Pizzaria do Bairro', issue: 'Muitos cancelamentos (8%)', action: 'Investigar problemas', severity: 'medium' }
            ].map((restaurant, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                restaurant.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{restaurant.name}</p>
                    <p className="text-sm text-gray-600">{restaurant.issue}</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      Ação: {restaurant.action}
                    </p>
                  </div>
                  <Badge variant={restaurant.severity === 'high' ? 'destructive' : 'default'}>
                    {restaurant.severity === 'high' ? 'Urgente' : 'Atenção'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}