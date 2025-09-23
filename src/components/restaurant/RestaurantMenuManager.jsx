
import React, { useState, useEffect, useCallback } from "react";
import { MenuItem } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Eye,
  EyeOff,
  Trash2,
  RefreshCw
} from "lucide-react";

import MenuItemForm from "../menu/MenuItemForm";

const categories = [
  { value: "entrada", label: "Entradas" },
  { value: "prato_principal", label: "Pratos Principais" },
  { value: "sobremesa", label: "Sobremesas" },
  { value: "bebida", label: "Bebidas" },
  { value: "lanche", label: "Lanches" },
  { value: "acompanhamento", label: "Acompanhamentos" }
];

export default function RestaurantMenuManager({ restaurantId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const loadMenuItems = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const items = await MenuItem.filter({ restaurant_id: restaurantId });
      setMenuItems(items);
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error);
    }
    setIsLoading(false);
  }, [restaurantId]); // Dependency added: restaurantId

  const filterItems = useCallback(() => {
    let filtered = [...menuItems];

    if (selectedCategory !== "todos") {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por categoria e nome
    filtered.sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.nome.localeCompare(b.nome);
    });

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]); // Dependencies added: menuItems, searchTerm, selectedCategory

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]); // Dependency updated: loadMenuItems

  useEffect(() => {
    filterItems();
  }, [filterItems]); // Dependency updated: filterItems

  const handleSubmit = async (itemData) => {
    try {
      if (editingItem) {
        await MenuItem.update(editingItem.id, itemData);
      } else {
        await MenuItem.create({ ...itemData, restaurant_id: restaurantId });
      }
      setShowForm(false);
      setEditingItem(null);
      loadMenuItems();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleToggleAvailability = async (item) => {
    try {
      await MenuItem.update(item.id, { disponivel: !item.disponivel });
      loadMenuItems();
    } catch (error) {
      console.error("Erro ao alterar disponibilidade:", error);
    }
  };

  const handleDelete = async (item) => {
    if (confirm(`Tem certeza que deseja remover "${item.nome}" do cardápio?`)) {
      try {
        await MenuItem.delete(item.id);
        loadMenuItems();
      } catch (error) {
        console.error("Erro ao remover item:", error);
      }
    }
  };

  const getCategoryLabel = (category) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  if (showForm) {
    return (
      <MenuItemForm
        item={editingItem}
        restaurantId={restaurantId}
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Gestão do Cardápio</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 max-w-xs"
              />
            </div>
            <Button onClick={loadMenuItems} disabled={isLoading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-gray-100 mb-6 flex-wrap">
            <TabsTrigger value="todos">
              Todos ({menuItems.length})
            </TabsTrigger>
            {categories.map((category) => {
              const count = menuItems.filter(item => item.categoria === category.value).length;
              return (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Carregando cardápio...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== "todos" 
                    ? "Nenhum item encontrado com os filtros aplicados" 
                    : "Nenhum item no cardápio ainda"}
                </p>
                <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Imagem */}
                    <div className="w-full md:w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imagem_url ? (
                        <img
                          src={item.imagem_url}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&h=100&fit=crop";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                          Sem foto
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{item.nome}</h3>
                            <Badge className={`capitalize ${item.disponivel ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {item.disponivel ? 'Disponível' : 'Indisponível'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {getCategoryLabel(item.categoria)}
                            </Badge>
                          </div>
                          {item.descricao && (
                            <p className="text-gray-600 text-sm mb-2">{item.descricao}</p>
                          )}
                          <p className="font-bold text-xl text-green-600">€{item.preco?.toFixed(2)}</p>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAvailability(item)}
                            title={item.disponivel ? "Tornar indisponível" : "Tornar disponível"}
                          >
                            {item.disponivel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
