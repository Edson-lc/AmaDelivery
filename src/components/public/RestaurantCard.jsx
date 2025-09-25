import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Percent, Tag } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant, isPromotional = false }) {
  const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center";

  const getPromoBadge = () => {
    // Lógica de promoção simulada
    if (restaurant.nome.toLowerCase().includes('pizza')) {
      return (
        <Badge className="absolute top-2 left-2 bg-red-600 text-white border-none">
          <Percent className="w-3 h-3 mr-1" />
          -20% em pizzas
        </Badge>
      );
    }
    if (restaurant.categoria === 'hamburguer') {
      return (
        <Badge className="absolute top-2 left-2 bg-orange-500 text-white border-none">
          <Tag className="w-3 h-3 mr-1" />
          2 por 1
        </Badge>
      );
    }
    return null;
  }

  return (
    <Link to={createPageUrl(`RestaurantMenu?id=${restaurant.id}`)} className="group block">
      <Card className="overflow-hidden border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="relative">
          <img
            src={restaurant.imagem_url || defaultImage}
            alt={restaurant.nome}
            className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${isPromotional ? 'h-48' : 'h-40'}`}
            onError={(e) => { e.target.src = defaultImage; }}
          />
          {getPromoBadge()}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 mb-1 flex-grow">{restaurant.nome}</h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
            <Badge variant="outline" className="capitalize">{restaurant.categoria}</Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{restaurant.avaliacao?.toFixed(1) || 'Novo'}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}