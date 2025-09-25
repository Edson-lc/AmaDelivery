
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  ativo: "bg-green-100 text-green-800 border-green-200",
  inativo: "bg-gray-100 text-gray-800 border-gray-200",
  suspenso: "bg-red-100 text-red-800 border-red-200"
};

const statusLabels = {
  ativo: "Ativo",
  inativo: "Inativo",
  suspenso: "Suspenso"
};

const categoryEmojis = {
  brasileira: "🇧🇷",
  italiana: "🍝",
  japonesa: "🍱",
  chinesa: "🥢",
  arabe: "🥙",
  mexicana: "🌮",
  hamburguer: "🍔",
  pizza: "🍕",
  saudavel: "🥗",
  sobremesas: "🍰",
  lanches: "🥪",
  outros: "🍽️"
};

export default function RestaurantCard({ restaurant, onEdit, onViewDetails }) {
  const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center";

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Imagem do restaurante */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.imagem_url || defaultImage}
          alt={restaurant.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badge de status */}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusColors[restaurant.status]} border font-medium`}>
            {statusLabels[restaurant.status]}
          </Badge>
        </div>

        {/* Menu de ações */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                <MoreHorizontal className="w-4 h-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Informações sobrepostas */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg mb-1">{restaurant.nome}</h3>
          <div className="flex items-center gap-2">
            <span className="text-white/90 text-sm">
              {categoryEmojis[restaurant.categoria]} {restaurant.categoria}
            </span>
            {restaurant.avaliacao && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white/90 text-sm">{restaurant.avaliacao.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Endereço */}
        {restaurant.endereco && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">{restaurant.endereco}</p>
          </div>
        )}

        {/* Contato */}
        <div className="flex items-center gap-4">
          {restaurant.telefone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{restaurant.telefone}</span>
            </div>
          )}
        </div>

        {/* Informações operacionais */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{restaurant.tempo_preparo || 30} min</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>€ {restaurant.taxa_entrega?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Descrição */}
        {restaurant.descricao && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {restaurant.descricao}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
