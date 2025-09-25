import React, { useState, useEffect, useCallback } from "react";
import { Restaurant, MenuItem } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft, Loader2, UtensilsCrossed } from "lucide-react";
import MenuItemForm from "../components/menu/MenuItemForm";
import MenuItemListItem from "../components/menu/MenuItemListItem";

export default function MenuManagementPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('restaurantId');

  const loadData = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const [restaurantData, itemsData] = await Promise.all([
        Restaurant.get(restaurantId),
        MenuItem.filter({ restaurant_id: restaurantId }, '-created_date'),
      ]);
      setRestaurant(restaurantData);
      setMenuItems(itemsData);
    } catch (error) {
      console.error("Erro ao carregar dados do cardápio:", error);
    }
    setIsLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormVisible(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingItem(null);
  };



  const handleSubmit = async (itemData) => {
    try {
      if (editingItem) {
        await MenuItem.update(editingItem.id, itemData);
      } else {
        await MenuItem.create({ ...itemData, restaurant_id: restaurantId });
      }
      setIsFormVisible(false);
      setEditingItem(null);
      await loadData(); // Recarregar os dados
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      alert("Ocorreu um erro ao salvar. Verifique os dados e tente novamente.");
    }
  };
  
    const handleDelete = async (itemId) => {
    if (window.confirm("Tem certeza que deseja apagar este item?")) {
      try {
        await MenuItem.delete(itemId);
        await loadData();
      } catch (error) {
        console.error("Erro ao apagar item:", error);
        alert("Ocorreu um erro ao apagar o item.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!restaurant) {
    return <div className="text-center py-10">Restaurante não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Gerenciar Cardápio</CardTitle>
                <p className="text-gray-600">Restaurante: {restaurant.nome}</p>
              </div>
              <Button
                onClick={() => isFormVisible ? handleCancel() : handleCreateNew()}
                variant={isFormVisible ? "outline" : "default"}
                className={!isFormVisible ? "bg-gradient-to-r from-orange-500 to-red-500" : ""}
              >
                {isFormVisible ? <ArrowLeft className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {isFormVisible ? "Voltar à Lista" : "Novo Item"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isFormVisible ? (
              <MenuItemForm
                item={editingItem}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            ) : (
              <div className="space-y-4">
                {menuItems.length > 0 ? (
                  menuItems.map(item => (
                    <MenuItemListItem
                      key={item.id}
                      item={item}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800">Nenhum item no cardápio</h3>
                    <p>Clique em &quot;Novo Item&quot; para começar a montar seu cardápio.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}