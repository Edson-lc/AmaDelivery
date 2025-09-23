
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MenuItem, Order } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  DollarSign,
  Store,
  ShoppingBag,
  TrendingUp
} from "lucide-react";

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

export default function RestaurantDetails({ restaurant, onBack, onEdit }) {
  const [menuItems, setMenuItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalPedidos: 0,
    faturamentoMes: 0,
    avaliacaoMedia: 0,
    itensCardapio: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadRestaurantData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [items, orders] = await Promise.all([
        MenuItem.filter({ restaurant_id: restaurant.id }),
        Order.filter({ restaurant_id: restaurant.id }, '-created_date', 10)
      ]);

      setMenuItems(items);
      setRecentOrders(orders);

      // Calcular estatísticas
      const faturamentoMes = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      setStats({
        totalPedidos: orders.length,
        faturamentoMes,
        avaliacaoMedia: restaurant.avaliacao || 0,
        itensCardapio: items.length
      });

    } catch (error) {
      console.error("Erro ao carregar dados do restaurante:", error);
    }
    setIsLoading(false);
  }, [restaurant.id, restaurant.avaliacao]);

  useEffect(() => {
    loadRestaurantData();
  }, [loadRestaurantData]);

  const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center";

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="relative h-64">
          <img
            src={restaurant.imagem_url || defaultImage}
            alt={restaurant.nome}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="absolute top-4 right-4">
            <Badge className={`${statusColors[restaurant.status]} border font-medium`}>
              {statusLabels[restaurant.status]}
            </Badge>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{restaurant.nome}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="capitalize">{restaurant.categoria}</span>
                  {restaurant.avaliacao && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{restaurant.avaliacao.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => onEdit(restaurant)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Restaurante
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPedidos}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold text-gray-900">€ {stats.faturamentoMes.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliação</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avaliacaoMedia.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Itens do Cardápio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.itensCardapio}</p>
              </div>
              <Store className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo com Abas */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="menu">Cardápio ({menuItems.length})</TabsTrigger>
          <TabsTrigger value="orders">Pedidos Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {restaurant.endereco && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-gray-600">{restaurant.endereco}</p>
                    </div>
                  </div>
                )}

                {restaurant.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-gray-600">{restaurant.telefone}</p>
                    </div>
                  </div>
                )}

                {restaurant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">{restaurant.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Configurações Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Tempo de Preparo</p>
                    <p className="text-gray-600">{restaurant.tempo_preparo || 30} minutos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Taxa de Entrega</p>
                    <p className="text-gray-600">€ {restaurant.taxa_entrega?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Valor Mínimo</p>
                    <p className="text-gray-600">€ {restaurant.valor_minimo?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {restaurant.descricao && (
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Sobre o Restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{restaurant.descricao}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="menu">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cardápio</CardTitle>
                <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Link to={createPageUrl(`Menu?restaurantId=${restaurant.id}`)}>
                    Gerenciar Cardápio
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {menuItems.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum item no cardápio</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.nome}</h4>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                        <p className="text-sm text-gray-500 capitalize">{item.categoria}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€ {item.preco?.toFixed(2)}</p>
                        <Badge variant={item.disponivel ? "default" : "secondary"}>
                          {item.disponivel ? "Disponível" : "Indisponível"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                      <div>
                        <p className="font-medium">{order.cliente_nome}</p>
                        <p className="text-sm text-gray-600">
                          {order.itens?.length || 0} itens • {order.forma_pagamento}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€ {order.total?.toFixed(2)}</p>
                        <Badge variant="secondary">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
