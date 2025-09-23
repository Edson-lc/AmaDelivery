import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Star, TrendingUp, DollarSign } from "lucide-react";

export default function TopRestaurants({ restaurants, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Top Restaurantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Store className="w-5 h-5 text-orange-600" />
          Top Restaurantes por Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {restaurants.length === 0 ? (
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum restaurante encontrado</p>
          </div>
        ) : (
          restaurants.map((restaurant, index) => (
            <div 
              key={restaurant.id} 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600', 'bg-blue-500', 'bg-purple-500'][index] || 'bg-gray-500'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 truncate">{restaurant.nome}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {restaurant.categoria}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {restaurant.avaliacao?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {restaurant.totalPedidos} pedidos
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span className="text-sm font-semibold text-green-600">
                    €{restaurant.faturamento?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}