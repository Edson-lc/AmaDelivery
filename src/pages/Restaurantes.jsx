import React, { useState, useEffect, useCallback } from "react";
import { Restaurant, MenuItem, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Store, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  Clock,
  Filter,
  MoreHorizontal
} from "lucide-react";

import RestaurantForm from "../components/restaurants/RestaurantForm";
import RestaurantCard from "../components/restaurants/RestaurantCard";
import RestaurantDetails from "../components/restaurants/RestaurantDetails";

export default function RestaurantesPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [isLoading, setIsLoading] = useState(true);

  const filterRestaurants = useCallback(() => {
    let filtered = restaurants;

    if (searchTerm) {
      filtered = filtered.filter(restaurant => 
        restaurant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.categoria && restaurant.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.endereco && restaurant.endereco.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter(restaurant => restaurant.status === statusFilter);
    }

    if (categoryFilter !== "todas") {
      filtered = filtered.filter(restaurant => restaurant.categoria === categoryFilter);
    }

    setFilteredRestaurants(filtered);
  }, [searchTerm, statusFilter, categoryFilter, restaurants]);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [filterRestaurants]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await Restaurant.list('-created_date');
      setRestaurants(data);
    } catch (error) {
      console.error("Erro ao carregar restaurantes:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (restaurantData) => {
    try {
      if (editingRestaurant) {
        await Restaurant.update(editingRestaurant.id, restaurantData);
      } else {
        await Restaurant.create(restaurantData);
      }
      setShowForm(false);
      setEditingRestaurant(null);
      loadRestaurants();
    } catch (error) {
      console.error("Erro ao salvar restaurante:", error);
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setShowForm(true);
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const categories = [
    "todas", "brasileira", "italiana", "japonesa", "chinesa", "arabe", 
    "mexicana", "hamburguer", "pizza", "saudavel", "sobremesas", "lanches", "outros"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Restaurantes</h1>
            <p className="text-gray-600 mt-2">
              Gerencie todos os restaurantes parceiros da sua plataforma
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Restaurante
          </Button>
        </div>

        {/* Filtros e Busca */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, categoria ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="ativo">Ativos</TabsTrigger>
                  <TabsTrigger value="inativo">Inativos</TabsTrigger>
                  <TabsTrigger value="suspenso">Suspensos</TabsTrigger>
                </TabsList>
              </Tabs>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'todas' ? 'Todas as Categorias' : 
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
        </Card>

        {/* Conteúdo Principal */}
        {showForm ? (
          <RestaurantForm
            restaurant={editingRestaurant}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingRestaurant(null);
            }}
          />
        ) : selectedRestaurant ? (
          <RestaurantDetails
            restaurant={selectedRestaurant}
            onBack={() => setSelectedRestaurant(null)}
            onEdit={handleEdit}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="border-none shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredRestaurants.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum restaurante encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Não há restaurantes que correspondem aos filtros selecionados
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Restaurante
                </Button>
              </div>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onEdit={() => handleEdit(restaurant)}
                  onViewDetails={() => handleViewDetails(restaurant)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}