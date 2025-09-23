
import React, { useState, useEffect, useCallback } from "react";
import { Restaurant } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
  Sparkles
} from "lucide-react";

import RestaurantCard from "../components/public/RestaurantCard";
import FilterSidebar from "../components/public/FilterSidebar";
import PromotionalSlider from "../components/public/PromotionalSlider";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    sortBy: "avaliacao",
    category: "todas",
    search: ""
  });

  const loadRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeRestaurants = await Restaurant.filter({ status: "ativo" });
      setRestaurants(activeRestaurants);
    } catch (error) {
      console.error("Erro ao carregar restaurantes:", error);
    }
    setIsLoading(false);
  }, []);

  const filterAndSortRestaurants = useCallback(() => {
    let filtered = [...restaurants];

    // Filtrar por categoria
    if (activeFilters.category !== "todas") {
      filtered = filtered.filter(r => r.categoria === activeFilters.category);
    }

    // Filtrar por busca
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.nome.toLowerCase().includes(searchTerm) ||
        r.descricao?.toLowerCase().includes(searchTerm) ||
        r.categoria.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenar
    switch (activeFilters.sortBy) {
      case "avaliacao":
        filtered.sort((a, b) => (b.avaliacao || 0) - (a.avaliacao || 0));
        break;
      case "taxa_entrega":
        filtered.sort((a, b) => (a.taxa_entrega || 0) - (b.taxa_entrega || 0));
        break;
      case "tempo_preparo":
        filtered.sort((a, b) => (a.tempo_preparo || 0) - (b.tempo_preparo || 0));
        break;
      default:
        break;
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, activeFilters]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    filterAndSortRestaurants();
  }, [filterAndSortRestaurants]);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const promotionalRestaurants = restaurants.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* O cabeçalho foi removido daqui e será gerenciado pelo Layout.jsx */}

      {/* Main Content - Otimizado para mobile */}
      <main className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar - Escondido no mobile */}
          <aside className="lg:col-span-1 hidden lg:block">
            <FilterSidebar 
              activeFilters={activeFilters} 
              onFilterChange={handleFilterChange} 
            />
          </aside>

          {/* Restaurants Grid - Otimizado para mobile */}
          <div className="lg:col-span-3">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-4 sm:mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleFilterChange('category', 'todas')}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    activeFilters.category === 'todas' 
                      ? 'bg-orange-100 text-orange-700 font-semibold' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                {['hamburguer', 'pizza', 'japonesa', 'italiana', 'saudavel'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange('category', cat)}
                    className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap capitalize transition-colors ${
                      activeFilters.category === cat 
                        ? 'bg-orange-100 text-orange-700 font-semibold' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Promotional Slider */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                Promoções Especiais
              </h2>
              <PromotionalSlider restaurants={promotionalRestaurants} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Todos os estabelecimentos</h2>
            
            {/* Grid responsivo para todos os restaurantes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-32 sm:h-40 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))
              ) : (
                <div className="sm:col-span-2 lg:col-span-3 text-center py-12 sm:py-16">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum restaurante encontrado</h3>
                  <p className="text-gray-500">Tente ajustar seus filtros.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
